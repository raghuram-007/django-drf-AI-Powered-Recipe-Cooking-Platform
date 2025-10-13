from rest_framework import serializers
from recipe_app.models import*
from recipe_app.models import User



class CommentSerializer(serializers.ModelSerializer):
    user=serializers.CharField(source='user.username',read_only=True)
    replies=serializers.SerializerMethodField()
    has_replies = serializers.SerializerMethodField()
    class Meta:
        model=Comment
        fields=['id', 'user','content','created_at','parent','replies','has_replies']
    def get_replies(self, obj):
       replies = obj.replies.all().order_by('created_at')
       return CommentSerializer(replies, many=True, context=self.context).data
   
    def get_has_replies(self, obj):
        return obj.replies.exists()
        
        
class RatingSerializer(serializers.ModelSerializer):
    user=serializers.CharField(source='user.username',read_only=True)
    class Meta:
        model=Rating
        fields=['id','user','stars']
        
    def create(self, validated_data):
        request = self.context.get('request')
        recipe = self.context.get('recipe')

        # check if user already rated this recipe
        rating, created = Rating.objects.update_or_create(
            user=request.user,
            recipe=recipe,
            defaults={'stars': validated_data['stars']}
        )
        return rating
        
        
class FavoriteSerializer(serializers.ModelSerializer):
    user=serializers.CharField(source='user.username',read_only=True)
    class Meta:
        model=Favorite
        fields=['id','user','created_at']
            
            
class NutrientSerializer(serializers.ModelSerializer):
    class Meta:
        model=Nutrient
        fields=['calories', 'protein', 'fat', 'carbs']
        
class RelatedRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image']


class RecipeSerializers(serializers.ModelSerializer):
    image=serializers.ImageField(required=True,use_url=True)
    author=serializers.CharField(source='author.username',read_only=True)
    author_id=serializers.IntegerField(source='author.id',read_only=True)
    nutrient=serializers.SerializerMethodField()
    related_recipes=serializers.SerializerMethodField()
    comments=CommentSerializer(many=True,read_only=True)
    ratings=RatingSerializer(many=True,read_only=True)
    favorites_count = serializers.IntegerField(source='favorites.count', read_only=True)
    is_favorite = serializers.SerializerMethodField()
    is_ai_generated = serializers.BooleanField(default=False) 
    featured=serializers.BooleanField()
    class Meta:
        model=Recipe
        fields= [
            'id', 'title', 'description', 'ingredients', 'instruction',
            'image', 'video', 'author', 'author_id','prep_time', 'cook_time', 'servings',
            'difficulty', 'featured', 'created_at', 'updated_at','is_ai_generated',
            'categories', 'nutrient', 'comments', 'ratings', 'favorites_count','is_favorite','related_recipes'
        ]
        read_only_fields=['author','author_id','created_at','updated_at']
    
    
    def get_related_recipes(self, obj):
     related = Recipe.objects.filter(categories__in=obj.categories.all()).exclude(id=obj.id).distinct()[:5]  # optional limit
     return RelatedRecipeSerializer(related, many=True, context=self.context).data

        
    def get_nutrient(self, obj):
     nutrient = getattr(obj, 'nutrient', None)
     if nutrient:
         return NutrientSerializer(nutrient).data
     return None


    
    def get_is_favorite(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.favorites.filter(user=user).exists()
        return False
 
class SignupSerializers(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User           # ← must be User, not "models"
        fields = [ 'email', 'full_name', 'password']

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')          # get full_name from POST
        username = full_name.replace(' ', '').lower()        # generate username automatically
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
         
         
class CategorySerializer(serializers.ModelSerializer):
    cat_image=serializers.ImageField(required=False,use_url=True)
    recipes_count = serializers.IntegerField(source='recipes.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'recipes_count','cat_image']
        
        
        

class UserSerializer(serializers.ModelSerializer):
    total_recipes=serializers.IntegerField(source='recipes.count',read_only=True)
    total_comments=serializers.IntegerField(source='comments.count',read_only=True)
    total_favorites=serializers.IntegerField(source='favorites.count',read_only=True)
    
    class Meta:
        model=User
        fields= ['id', 'username', 'email', 'date_joined', 'total_recipes', 'total_comments', 'total_favorites']
        
        
class MyRecipeSerializer(serializers.ModelSerializer):
    favorites_count = serializers.IntegerField(source='favorites.count', read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'created_at', 'updated_at', 'favorites_count', 'average_rating']

    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            return sum([r.stars for r in ratings]) / ratings.count()
        return 0

class MyFavoriteSerializer(serializers.ModelSerializer):
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)
    recipe_image = serializers.ImageField(source='recipe.image', read_only=True)
    author_username = serializers.CharField(source='recipe.author.username', read_only=True)
    date_added = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'recipe_title', 'recipe_image', 'author_username', 'date_added']


# -----------------------------
# User Comment Serializer
# -----------------------------
class MyCommentSerializer(serializers.ModelSerializer):
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)
    date_created = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'recipe_title', 'content', 'date_created']


# -----------------------------
# User Rating Serializer
# -----------------------------
class MyRatingSerializer(serializers.ModelSerializer):
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)
    date_created = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'recipe_title', 'stars', 'date_created']
        
        


class FollowerSerializer(serializers.ModelSerializer):
    followers=serializers.CharField(source='followers.username',read_only=True)
    following=serializers.CharField(source='following.username',read_only=True)
    
    class Meta:
        model=Follow
        fields=['id','follower','following','created_at']
        

class FeedRecipeSerializer(serializers.ModelSerializer):
    author=serializers.CharField(source='author.username',read_only=True)
    author_id=serializers.IntegerField(source='author.id',read_only=True)
    
    
    class Meta:
        model=Recipe
        fields=['id','title','image','author','created_at','author_id']
        
        
        
        
class SharedRecipeSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', read_only=True)
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)

    class Meta:
        model = SharedRecipe
        fields = ['id', 'sender', 'recipe', 'recipe_title', 'shared_at']



# Add to your serializers.py
class DirectShareSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', read_only=True)
    receiver = serializers.CharField(source='receiver.username', read_only=True)
    receiver_id = serializers.IntegerField(source='receiver.id', read_only=True)
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)
    recipe_image = serializers.ImageField(source='recipe.image', read_only=True)

    class Meta:
        model = DirectShare
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'recipe', 'recipe_title', 'recipe_image', 'message', 'shared_at', 'is_read']

class FollowerListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='following.id')
    username = serializers.CharField(source='following.username')
    email = serializers.CharField(source='following.email')
    
    class Meta:
        model = Follow
        fields = ['id', 'username', 'email', 'created_at']