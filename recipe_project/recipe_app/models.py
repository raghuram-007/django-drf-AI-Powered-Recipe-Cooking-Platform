from django.db import models
from django.contrib.auth.models import User
import datetime
from django.utils import timezone

# Create your models here.
class Recipe(models.Model):
    title=models.CharField(max_length=200)
    description=models.TextField()
    ingredients=models.TextField()
    instruction=models.TextField()
    image=models.ImageField(upload_to='recipes/',null=True,blank=True)
    video=models.FileField(upload_to='recipes/videos/',null=True,blank=True)
    author=models.ForeignKey(User,on_delete=models.CASCADE,related_name='recipes')
    prep_time=models.IntegerField(help_text="Preparation time in minutes",default=0)
    cook_time=models.IntegerField(help_text="Cooking time in minutes",default=0)
    difficulty=models.CharField(max_length=50,choices=[('Easy','Easy'),('Medium','Medium'),('Hard','Hard')],default='Easy')
    servings=models.IntegerField(default=1)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    featured=models.BooleanField(default=False)
    is_ai_generated = models.BooleanField(default=False) 
    
    
    def __str__(self):
        return self.title
    

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    cat_image=models.ImageField(upload_to='category/',blank=True,null=True)
    icon = models.CharField(max_length=5, blank=True, null=True)  # optional emoji/icon
    recipes = models.ManyToManyField(Recipe, related_name='categories', blank=True)

    def __str__(self):
        return self.name
    
    
class Nutrient(models.Model):
    recipes_nutrient=models.OneToOneField(Recipe,on_delete=models.CASCADE,related_name='nutrient')
    calories=models.IntegerField(default=0)
    protein=models.FloatField(default=0.0)
    fat=models.FloatField(default=0.0)
    carbs=models.FloatField(default=0.0)
    
    def __str__(self):
        return self.recipes_nutrient.title
    
    
class Comment(models.Model):
    recipe=models.ForeignKey(Recipe,on_delete=models.CASCADE,related_name='comments')
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='comments')
    content=models.TextField()
    parent=models.ForeignKey('self',null=True,blank=True,on_delete=models.CASCADE,related_name='replies')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.recipe.title}"
    
    
class Rating(models.Model):
    recipe=models.ForeignKey(Recipe,on_delete=models.CASCADE,related_name='ratings')
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='ratings')
    stars=models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    
    class Meta:
        unique_together = ('recipe', 'user')  # ensures 1 rating per user per recipe
       
    def save(self, *args, **kwargs):
        # ensure stars are between 1 and 5
        if self.stars < 1:
            self.stars = 1
        elif self.stars > 5:
            self.stars = 5
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} rated {self.recipe.title} ({self.stars}⭐)"
   
    
    
class Favorite(models.Model):
    recipe=models.ForeignKey(Recipe,on_delete=models.CASCADE,related_name='favorites')
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"
    
    
    
    

class Follow(models.Model):
    follower=models.ForeignKey(User,on_delete=models.CASCADE,related_name='following')
    following=models.ForeignKey(User,on_delete=models.CASCADE,related_name='followers')
    created_at=models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together=('follower','following')
        
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
    
    
    
    
class SharedRecipe(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='shares')
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} shared {self.recipe.title}"

    
# Add this to your models.py
class DirectShare(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_shares')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_shares')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='direct_shares')
    message = models.TextField(blank=True, null=True)
    shared_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        unique_together = ('sender', 'receiver', 'recipe')
        
    def __str__(self):
        return f"{self.sender.username} shared {self.recipe.title} with {self.receiver.username}"
    
    
    
    
