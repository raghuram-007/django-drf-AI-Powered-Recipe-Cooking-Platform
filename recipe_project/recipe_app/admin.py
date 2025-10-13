from django.contrib import admin
from recipe_app.models import*




# Register your models here.
class NutrientInline(admin.StackedInline):
    model = Nutrient
    extra = 0 

class RecipeAdmin(admin.ModelAdmin):
    list_display=['title','author','created_at']
    list_filter=['title','author']
    search_fields=['title','author__username']
    inlines = [NutrientInline] 
    
class CategoryAdmin(admin.ModelAdmin):
    list_display=['name','icon']
    search_fields=['name']

admin.site.register(Category,CategoryAdmin)
    
admin.site.register(Recipe,RecipeAdmin)
