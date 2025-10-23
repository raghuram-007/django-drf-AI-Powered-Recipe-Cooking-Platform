from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from recipe_app.models import *
from recipe_app.serializers import *
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
from datetime import datetime
import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
import json
import re
from .utils import send_new_recipe_email
from django.http import JsonResponse




genai.configure(api_key=settings.GEMINI_API_KEY)

def home(request):
    return JsonResponse({"message": "API is running"})
    
    
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_generate_structured_recipe(request):
    """
    Generate recipe with structured JSON data for form auto-fill
    """
    try:
        description = request.data.get('description', '').strip()
        
        if not description:
            return Response({"error": "Please provide a recipe description."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Enhanced prompt for structured data
        prompt = f"""
        Create a detailed recipe for: "{description}"
        
        Return ONLY a JSON object with the following structure:
        {{
            "title": "Recipe title",
            "description": "Brief description of the recipe",
            "ingredients": ["1 cup ingredient1", "2 tbsp ingredient2", ...],
            "instructions": ["Step 1 instruction", "Step 2 instruction", ...],
            "prep_time": 15,
            "cook_time": 30,
            "servings": 4,
            "difficulty": "Easy/Medium/Hard",
            "tips": ["Tip 1", "Tip 2", ...]
        }}
        
        Make sure ingredients and instructions are arrays. Prep and cook time in minutes.
        """

        try:
            # Use a valid Gemini model
            model = genai.GenerativeModel("models/gemini-2.5-flash")
            response = model.generate_content(prompt)
            
            # Extract JSON from response
            text = response.text.strip()
            
            # Try to parse JSON from the response
            try:
                # Find JSON pattern in the response
                json_match = re.search(r'\{.*\}', text, re.DOTALL)
                if json_match:
                    recipe_data = json.loads(json_match.group())
                else:
                    # Fallback: return as raw text but structured
                    recipe_data = {
                        "title": f"AI Recipe: {description}",
                        "description": "AI-generated recipe",
                        "ingredients": ["Check the raw response for details"],
                        "instructions": ["Check the raw response for steps"],
                        "prep_time": 15,
                        "cook_time": 30,
                        "servings": 4,
                        "difficulty": "Medium",
                        "raw_response": text
                    }
                
                return Response({
                    "success": True,
                    "recipe_data": recipe_data
                })
                
            except json.JSONDecodeError:
                # If JSON parsing fails, return structured error
                return Response({
                    "success": True,
                    "recipe_data": {
                        "title": f"AI Recipe: {description}",
                        "description": text[:200] + "..." if len(text) > 200 else text,
                        "ingredients": ["Please manually extract from the description"],
                        "instructions": ["Please manually extract from the description"],
                        "prep_time": 15,
                        "cook_time": 30,
                        "servings": 4,
                        "difficulty": "Medium",
                        "raw_response": text
                    }
                })
                
        except Exception as gen_error:
            return Response({
                "error": f"AI generation failed: {str(gen_error)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            "error": f"Internal server error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    
# ---------- Custom Permissions ----------
class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Only allow authors of an object to edit/delete it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Works for Recipe, Comment, Rating models (check attribute dynamically)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'author'):
            return obj.author == request.user
        return False


# ---------- Recipe ViewSet ----------
class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().order_by('-created_at')
    serializer_class = RecipeSerializers
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['title', 'description', 'ingredients']
    filterset_fields = ['categories__id','featured']
    # pagination_class = StandardResultsSetPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser] 
    ordering_fields = ['created_at', 'prep_time', 'cook_time', 'difficulty']

    def perform_create(self, serializer):
        recipe = serializer.save(author=self.request.user)
        nutrient_data = {
            'calories': self.request.data.get('calories'),
            'protein': self.request.data.get('protein'),
            'fat': self.request.data.get('fat'),
            'carbs': self.request.data.get('carbs'),
        }
        if any(nutrient_data.values()):
            Nutrient.objects.create(recipes_nutrient=recipe, **nutrient_data)
            
        recipients = [recipe.author.email] 
        
        followers = Follow.objects.filter(following=recipe.author)
        followers_emails = [f.follower.email for f in followers if f.follower.email]
        recipients += followers_emails
        
        if recipients:
         send_new_recipe_email(recipe, recipients)
         

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_recipes = Recipe.objects.filter(featured=True)
        serializer = self.get_serializer(featured_recipes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def add_comment(self, request, pk=None):
        recipe = self.get_object()
        parent_id = request.data.get('parent')
        parent_comment = None
        
        # Handle reply to existing comment
        if parent_id:
            try:
                parent_comment = Comment.objects.get(id=parent_id, recipe=recipe)
                # Optional: limit nesting to 1 level
                if parent_comment.parent is not None:
                    return Response(
                        {"detail": "Replies to replies are not allowed."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Comment.DoesNotExist:
                return Response(
                    {"detail": "Parent comment does not exist for this recipe."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, recipe=recipe, parent=parent_comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticatedOrReadOnly])
    def delete_comment(self, request, pk=None):
      try:
        comment = Comment.objects.get(id=request.data.get('comment_id'), user=request.user)
        comment.delete()
        return Response({"detail": "Comment deleted successfully."}, status=status.HTTP_200_OK)
      except Comment.DoesNotExist:
        return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def add_rating(self, request, pk=None):
        recipe = self.get_object()
        serializer = RatingSerializer(data=request.data, context={'request': request, 'recipe': recipe})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def add_favorite(self, request, pk=None):
        recipe = self.get_object()
        favorite, created = Favorite.objects.get_or_create(user=request.user, recipe=recipe)
        if created:
            serializer = FavoriteSerializer(favorite)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"detail": "Recipe already in favorites."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def remove_favorite(self, request, pk=None):
        recipe = self.get_object()
        try:
            favorite = Favorite.objects.get(user=request.user, recipe=recipe)
            favorite.delete()
            return Response({"detail": "Recipe removed from favorites."}, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            return Response({"detail": "Recipe not in favorites."}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def share_to_followers(self, request, pk=None):
     recipe = self.get_object()
     SharedRecipe.objects.create(sender=request.user, recipe=recipe)
     return Response({"detail": f"Recipe '{recipe.title}' shared to your followers!"}, status=status.HTTP_201_CREATED)



# ---------- User Authentication ----------
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "User Created Successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "success": False,
            "message": "User Creation Failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Invalid email or password"},
                            status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=user.username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "message": "Login successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_id": user.id,  # ADD THIS LINE
                "user_email": user.email  # ADD THIS LINE
            }, status=status.HTTP_200_OK)
        return Response({"success": False, "message": "Invalid email or password"},
                        status=status.HTTP_401_UNAUTHORIZED)


# ---------- Category Views ----------
class CategoryListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class CategoryRecipesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        recipes = category.recipes.all()
        serializer = RecipeSerializers(recipes, many=True, context={'request': request})
        return Response(serializer.data)


# # ---------- User Profile ----------
# class UserProfileView(APIView):
#     permission_classes = [IsAuthenticatedOrReadOnly]

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)


#     
# ---------- User Recipes (CRUD) ----------


class UserRecipeViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeSerializers
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    parser_classes = [MultiPartParser, FormParser] 
   

    def get_queryset(self):
        # Only recipes created by the logged-in user
        return Recipe.objects.filter(author=self.request.user).order_by('-created_at')


# ---------- User Comments (CRUD) ----------
class UserCommentViewSet(viewsets.ModelViewSet):
    serializer_class = MyCommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
   

    def get_queryset(self):
        # Only comments by the logged-in user
        return Comment.objects.filter(user=self.request.user).order_by('-created_at')


# ---------- User Ratings (CRUD) ----------
class UserRatingViewSet(viewsets.ModelViewSet):
    serializer_class = MyRatingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    

    def get_queryset(self):
        # Only ratings by the logged-in user
        return Rating.objects.filter(user=self.request.user).order_by('-created_at')


# ---------- User Favorites (View + Delete) ----------
class UserFavoriteViewSet(viewsets.ModelViewSet):
    """
    Users can list their favorites or retrieve details.
    Deletion can be handled via RecipeViewSet.remove_favorite action.
    """
    serializer_class = MyFavoriteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by('-id')
    
    
    
    
    
# views.py (add after your last ViewSet)

class FollowViewSet(viewsets.ModelViewSet):
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def follow(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "User ID required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=user_id)
            if target_user == request.user:
                return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

            follow, created = Follow.objects.get_or_create(follower=request.user, following=target_user)
            if created:
                return Response({"detail": f"You are now following {target_user.username}."}, status=status.HTTP_201_CREATED)
            return Response({"detail": "Already following this user."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def unfollow(self, request):
        user_id = request.data.get('user_id')
        try:
            target_user = User.objects.get(id=user_id)
            follow = Follow.objects.get(follower=request.user, following=target_user)
            follow.delete()
            return Response({"detail": f"Unfollowed {target_user.username}."}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, Follow.DoesNotExist):
            return Response({"detail": "Follow relationship not found."}, status=status.HTTP_404_NOT_FOUND)


class FeedView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        # 1️⃣ Get IDs of users the current user is following
        following_user_ids = request.user.following.values_list('following', flat=True)

        # 2️⃣ Fetch recipes created by followed users
        recipes = Recipe.objects.filter(author__in=following_user_ids)
        recipe_data = FeedRecipeSerializer(recipes, many=True, context={'request': request}).data

        # Track IDs to avoid duplicates
        existing_recipe_ids = {r['id'] for r in recipe_data}

        # 3️⃣ Fetch recipes shared by followed users, exclude duplicates
        shared_recipes = SharedRecipe.objects.filter(sender__in=following_user_ids)
        shared_data = [
            {
                'id': f'shared-{s.id}',  # unique ID for React keys
                'type': 'shared',
                'shared_by': s.sender.username,
                'recipe_id': s.recipe.id,
                'title': s.recipe.title,
                'image': s.recipe.image.url if s.recipe.image else None,
                'author': s.recipe.author.username if s.recipe.author else '—',
                'created_at': s.shared_at
            }
            for s in shared_recipes
            if s.recipe.id not in existing_recipe_ids  # ✅ avoid duplicate recipes
        ]

        # 4️⃣ Helper function to parse dates for sorting
        def parse_date(item):
            date_value = item.get('created_at')
            if isinstance(date_value, str):
                return datetime.fromisoformat(date_value.replace('Z', '+00:00'))
            return date_value

        # 5️⃣ Combine authored + shared recipes and sort by newest
        combined_feed = sorted(recipe_data + shared_data, key=parse_date, reverse=True)

        return Response(combined_feed)



# Add these views to your views.py
class FollowersListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        # Get users that the current user is following
        following_users = Follow.objects.filter(follower=request.user).select_related('following')
        serializer = FollowerListSerializer(following_users, many=True)
        return Response(serializer.data)

class DirectShareView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def post(self, request, recipe_id):
        recipe = get_object_or_404(Recipe, id=recipe_id)
        receiver_ids = request.data.get('receiver_ids', [])
        message = request.data.get('message', '')
        
        if not receiver_ids:
            return Response({"detail": "Please select at least one follower to share with."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        shares_created = []
        for receiver_id in receiver_ids:
            try:
                receiver = User.objects.get(id=receiver_id)
                # Check if user is actually following this receiver
                if not Follow.objects.filter(follower=request.user, following=receiver).exists():
                    continue
                
                share, created = DirectShare.objects.get_or_create(
                    sender=request.user,
                    receiver=receiver,
                    recipe=recipe,
                    defaults={'message': message}
                )
                if created:
                    shares_created.append(share)
            except User.DoesNotExist:
                continue
        
        if shares_created:
            serializer = DirectShareSerializer(shares_created, many=True)
            return Response({
                "detail": f"Recipe shared with {len(shares_created)} follower(s) successfully!",
                "shares": serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({"detail": "No valid followers selected or recipe already shared."}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
            

class UserNotificationsView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        # Get unread shares for the current user
        unread_shares = DirectShare.objects.filter(receiver=request.user, is_read=False)
        serializer = DirectShareSerializer(unread_shares, many=True)
        return Response(serializer.data)
    
    def patch(self, request, share_id):
        # Mark a share as read
        share = get_object_or_404(DirectShare, id=share_id, receiver=request.user)
        share.is_read = True
        share.save()
        return Response({"detail": "Notification marked as read."})

# Update your urls.py to include these new endpoints



# Add this to your views.py
class SharedRecipesView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        # Get all users who shared recipes with current user
        sharers = User.objects.filter(
            sent_shares__receiver=request.user
        ).distinct()
        
        sharer_data = []
        for sharer in sharers:
            # Get shared recipes from this user
            shared_recipes = DirectShare.objects.filter(
                sender=sharer,
                receiver=request.user
            ).select_related('recipe')
            
            sharer_data.append({
                'sharer_id': sharer.id,
                'sharer_username': sharer.username,
                'sharer_email': sharer.email,
                'total_shared': shared_recipes.count(),
                'unread_count': shared_recipes.filter(is_read=False).count(),
                'last_shared': shared_recipes.order_by('-shared_at').first().shared_at if shared_recipes.exists() else None,
                'shared_recipes': [
                    {
                        'share_id': share.id,
                        'recipe_id': share.recipe.id,
                        'recipe_title': share.recipe.title,
                        'recipe_image': share.recipe.image.url if share.recipe.image else None,
                        'recipe_description': share.recipe.description,
                        'shared_at': share.shared_at,
                        'is_read': share.is_read,
                        'message': share.message
                    }
                    for share in shared_recipes
                ]
            })
        
        return Response(sharer_data)

class MarkSharedAsReadView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def patch(self, request, share_id):
        share = get_object_or_404(DirectShare, id=share_id, receiver=request.user)
        share.is_read = True
        share.save()
        return Response({"detail": "Marked as read"})
    
    
    
# ========== AI COOKING COACH & TRENDING RECIPES ==========

@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def ai_trending_recipes(request):
    """
    Find trending recipes and provide context + guidance
    """
    try:
        # Get optional filters from user
        category = request.data.get('category', '')
        time_filter = request.data.get('time_filter', 'current')  # current, week, month
        dietary_pref = request.data.get('dietary', '')
        
        prompt = f"""
        Suggest 3-5 trending recipes that are popular right now.
        
        Context:
        - Category preference: {category if category else 'any'}
        - Dietary preference: {dietary_pref if dietary_pref else 'any'}
        - Time period: {time_filter}
        
        For each recipe, return JSON with:
        {{
            "trending_recipes": [
                {{
                    "title": "Recipe name",
                    "trend_reason": "Why it's trending (social media, season, etc)",
                    "description": "Brief description",
                    "prep_time": 15,
                    "cook_time": 30,
                    "difficulty": "Easy/Medium/Hard",
                    "key_ingredients": ["ingredient1", "ingredient2"],
                    "viral_tips": ["Tip 1", "Tip 2"],
                    "estimated_popularity": "High/Medium/Low"
                }}
            ]
        }}
        
        Make them practical, seasonal, and include why they're trending.
        """

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse JSON response
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            trending_data = json.loads(json_match.group())
        else:
            trending_data = {
                "trending_recipes": [
                    {
                        "title": "Seasonal Special",
                        "trend_reason": "Popular based on current trends",
                        "description": "Check the raw response for details",
                        "prep_time": 15,
                        "cook_time": 30,
                        "difficulty": "Medium",
                        "key_ingredients": ["Fresh seasonal ingredients"],
                        "viral_tips": ["Great for social media sharing"],
                        "estimated_popularity": "Medium"
                    }
                ]
            }

        return Response({
            "success": True,
            "trending_data": trending_data,
            "filters_used": {
                "category": category,
                "time_filter": time_filter,
                "dietary": dietary_pref
            }
        })
        
    except Exception as e:
        return Response({
            "error": f"Failed to fetch trending recipes: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def ai_cooking_coach(request):
    """
    Real-time cooking guidance and troubleshooting
    """
    try:
        question = request.data.get('question', '').strip()
        recipe_context = request.data.get('recipe_context', '')  # Optional: current recipe info
        cooking_step = request.data.get('cooking_step', '')  # Optional: current step
        
        if not question:
            return Response({"error": "Please ask a cooking question."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
        User is cooking and needs help: "{question}"
        
        Context:
        - Current recipe: {recipe_context if recipe_context else 'Not specified'}
        - Cooking step: {cooking_step if cooking_step else 'Not specified'}
        
        Provide helpful, practical guidance with:
        1. Clear step-by-step instructions if applicable
        2. Common mistakes to avoid
        3. Pro tips and techniques
        4. Safety reminders if needed
        5. Troubleshooting for common issues
        6. Encouraging tone
        
        Format the response in a structured way that's easy to follow while cooking.
        """

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        return Response({
            "success": True,
            "question": question,
            "answer": response.text,
            "recipe_context": recipe_context,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            "error": f"Cooking coach unavailable: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def ai_recipe_guide(request):
    """
    Get step-by-step guided cooking for specific recipes
    """
    try:
        recipe_title = request.data.get('recipe_title', '').strip()
        recipe_instructions = request.data.get('recipe_instructions', '').strip()
        
        if not recipe_title or not recipe_instructions:
            return Response({"error": "Recipe title and instructions required."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
        Create a detailed cooking guide for: {recipe_title}
        
        Original instructions: {recipe_instructions}
        
        Transform this into an enhanced cooking guide with:
        
        ENHANCED INSTRUCTIONS:
        - Break down each step with more detail
        - Add timing estimates for each step
        - Include visual cues (what to look for)
        - Add pro tips for each step
        - Note common pitfalls
        
        TROUBLESHOOTING SECTION:
        - List common problems and solutions
        - How to fix mistakes
        - When to start over vs adjust
        
        SUCCESS INDICATORS:
        - How to know when each step is done correctly
        - Final dish characteristics
        
        Return as structured JSON that's easy to parse.
        """

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Try to parse JSON, else return as text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            guide_data = json.loads(json_match.group())
        else:
            guide_data = {
                "enhanced_guide": text,
                "recipe_title": recipe_title
            }

        return Response({
            "success": True,
            "recipe_title": recipe_title,
            "guided_instructions": guide_data
        })
        
    except Exception as e:
        return Response({
            "error": f"Failed to create recipe guide: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)