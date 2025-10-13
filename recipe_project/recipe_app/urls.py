from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from recipe_app.views import (
    RecipeViewSet,
    UserRecipeViewSet,
    UserCommentViewSet,
    UserFavoriteViewSet,
    UserRatingViewSet,
    SignupView,
    LoginView,
    CategoryListView,
    CategoryRecipesView,
    FollowViewSet,
    FeedView,
    FollowersListView,
    DirectShareView,
    UserNotificationsView,
    SharedRecipesView,
    MarkSharedAsReadView,
   # Keep existing
    ai_generate_structured_recipe,
    
)

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, basename='recipes')
router.register(r'user-recipes', UserRecipeViewSet, basename='user-recipes')
router.register(r'user-comments', UserCommentViewSet, basename='user-comments')
router.register(r'user-favorites', UserFavoriteViewSet, basename='user-favorites')
router.register(r'user-ratings', UserRatingViewSet, basename='user-ratings')
router.register(r'follows', FollowViewSet, basename='follow')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),  # includes my-recipes, my-comments, etc.
    
    # Auth
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    # Categories
    path('categories/', CategoryListView.as_view(), name='categories-list'),
    path('categories/<int:category_id>/recipes/', CategoryRecipesView.as_view(), name='category-recipes'),
     path('feed/', FeedView.as_view(), name='feed'),
     # Add these to your urls.py
     path('followers/', FollowersListView.as_view(), name='followers-list'),
     path('recipes/<int:recipe_id>/direct_share/', DirectShareView.as_view(), name='direct-share'),
     path('notifications/', UserNotificationsView.as_view(), name='user-notifications'),
     path('notifications/<int:share_id>/read/', UserNotificationsView.as_view(), name='mark-notification-read'),
     # Add to urls.py
    path('shared-recipes/', SharedRecipesView.as_view(), name='shared-recipes'),
    path('shared-recipes/<int:share_id>/read/', MarkSharedAsReadView.as_view(), name='mark-shared-read'),
    
    path('ai/generate-structured-recipe/', views.ai_generate_structured_recipe, name='ai_generate_structured_recipe'), 
    path('ai/trending-recipes/', views.ai_trending_recipes, name='ai_trending_recipes'),
    path('ai/cooking-coach/', views.ai_cooking_coach, name='ai_cooking_coach'),
    path('ai/recipe-guide/', views.ai_recipe_guide, name='ai_recipe_guide'), 
]
