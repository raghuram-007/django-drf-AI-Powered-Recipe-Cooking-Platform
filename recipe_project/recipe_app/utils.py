from django.core.mail import send_mail
from django.conf import settings

def send_new_recipe_email(recipe, recipients):
    """
    Send email notification about new recipe.
    :param recipe: Recipe instance
    :param recipients: List of email addresses
    """
    subject = f"New Recipe: {recipe.title}"
    message = f"""
Hi there,

A new recipe "{recipe.title}" has been created by {recipe.author.username}!

Description:
{recipe.description}

Check it out in our app!

- Recipe Platform Team
"""
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        recipients,
        fail_silently=False,
    )
