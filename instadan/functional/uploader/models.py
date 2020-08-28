from django.db import models
from django.utils import timezone
import datetime
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class User(AbstractUser):
    follows = models.ManyToManyField('self', symmetrical=False)

    def __str__(self):
        return self.username

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # check what cascade does
    img_ext = models.CharField(max_length=5, default='.jpg')
    caption = models.CharField(max_length=300)
    creation_datetime = models.DateTimeField('date_posted',auto_now_add=True)
    num_likes = models.PositiveIntegerField(default=0)
    num_comments = models.PositiveIntegerField(default=0)
    tags = ArrayField(models.CharField(max_length=50), default=list)

    def __str__(self):
        return "post by " + str(self.user)

    def was_posted_recently(self):
        return self.creation_datetime >= timezone.now() - datetime.timedelta(days=1)


class Comment(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    creation_datetime = models.DateTimeField('date_commented',auto_now_add=True)

    def __str__(self):
        return str(self.creation_datetime) + "| " + str(self.user) + ": " + self.text 

class Like(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_datetime = models.DateTimeField('date_liked',auto_now_add=True)

    def __str__(self):
        return str(self.user) + " likes " + str(self.post)