from django.shortcuts import render, redirect, get_object_or_404
from django.template import loader
from django.http import HttpResponse, Http404, HttpResponseRedirect
from .models import User, Post, Like, Comment
from django.core.files.storage import FileSystemStorage
from django.contrib.auth import authenticate, logout, login
from django.urls import reverse
from django.views import generic
from django.db.models import Q
import re
from django.core.paginator import Paginator

#For Creative Portion:
import prediction as pred
import os

#TODO: VALIDATE ALL INPUT
#TODO: Anonymous user can see global feed (no follows) 
#TODO: Add a user page (point all redirect)
#TODO: Anonymous global session
#TODO: Fix follow on search page
#TODO: Verify logged in before accessing
#TODO: Format and add home button to login/register

ext_reg = re.compile(r'\.(gif|jpg|jpeg|tiff|png)$', re.IGNORECASE)
# Create your views here.
def index(request, is_priv=0):
    if not request.user.is_authenticated:
        posts = Post.objects.order_by('-creation_datetime')
    else:
        if request.method =="GET" and request.GET.get('search', '') != '':
            return searchfor(request, request.GET.get('search'))
        if is_priv:
            user = request.user
            print(user.username)
            print(user.user_set.all())
            posts = Post.objects.filter(user__in=user.user_set.all()).order_by('-creation_datetime')
        else:
            posts = Post.objects.order_by('-creation_datetime')

    paginator = Paginator(posts, 5)
    page = request.GET.get('page')
    posts_by_page = paginator.get_page(page)
    return render(request, "uploader/wireframe.html", { 'posts':posts_by_page })

def upload(request):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    return render(request, 'uploader/upload.html', { })

def to(request):
    if request.method =='POST':
        if not request.user.is_authenticated:
            return redirect(reverse('insta:login'))
        img_file = request.FILES['img']
        ext = re.search(ext_reg, img_file.name)
        
        if ext == None:
            #TODO: DEAL WITH ERRORS/MESSAGES IN CONTEXT!!
            context = {'error': "Invalid file type, please try again"}
        else:
            new_caption = request.POST.get("caption", 'error')
            new_tags = request.POST.get("tags", '')
            new_tags = new_tags.replace(' ', '').split(',')
            new_tags = list(dict.fromkeys(new_tags))
           
            new_post = Post(user=request.user, img_ext=ext[0], caption=new_caption, tags=new_tags)
            new_post.save()
            print("UPLOADED!")
            print("Usr: %s, ID: %s, Cap: %s" %(new_post.user, new_post.id, new_post.caption))

            new_name = str(new_post.id)+new_post.img_ext
            print(new_name)
            fs = FileSystemStorage()
            fs.save(new_name,img_file)
        return redirect(reverse('insta:index'))

    #if request.FILES['img'].size is greater than x, return error
    #if request.FILES['img'].size has content_type y, return error

def comment_to(request, post_id):
    if request.method =='POST':
        if not request.user.is_authenticated:
            return redirect(reverse('insta:login'))
        else:
            comment_text = request.POST.get("newComment")
            p = get_object_or_404(Post,id=post_id)
            new_comment = Comment(post=p,user=request.user,text=comment_text)
            new_comment.save()
            p.num_comments += 1
            p.save()
        
        return HttpResponseRedirect(reverse('uploader:view', args=(post_id,)))

def login_view(request):
    if request.method == 'POST':
        usr = request.POST.get('username', '')
        pwd = request.POST.get('password', '')
        user = authenticate(username=usr, password=pwd)
        if user is not None:
            login(request, user)
            return redirect(reverse('insta:index'))
            #Data during anonymous session is retained 
        else:
            return render(request, 'uploader/login.html',{'error':'Failed login as %s. Please try again.'%(usr)})
    else:
        return render(request, 'uploader/login.html',{})

#TODO: Check that user is not already logged in, if so logout and log back in

    
def register(request):
    if request.method == 'POST':
        usr = request.POST.get('username', '')
        if User.objects.filter(username=usr).exists():
            return render(request, 'uploader/register.html', {'error':"User %s already exists, try again."%usr})
        else:
            email = request.POST.get('email', '')
            pwd = request.POST.get('password', '')
            fname = request.POST.get('first', '')
            lname = request.POST.get('last','')
            #TODO: SECURITY! SEE IF PROPERLY INPUT/ VALIDATE
            newUser = User.objects.create_user(usr, email, pwd)
            newUser.first_name= fname
            newUser.last_name = lname
            newUser.save()
            #TODO: Check that exists? 
            login(request, newUser)
            return redirect(reverse('insta:index'))
    else:
        return render(request, 'uploader/register.html', { })


def logout_view(request):
    logout(request)
    return redirect(reverse('insta:index'))

def unlike(request, post_id):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    this_post = get_object_or_404(Post,pk=post_id)
    this_like = Like.objects.filter(post=this_post, user=request.user)
    this_like.delete()
    this_post.num_likes -= 1
    this_post.save()
    return HttpResponseRedirect(reverse('uploader:view', args=(post_id,)))

def like(request, post_id):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    this_post = get_object_or_404(Post,pk=post_id)
    new_like = Like(post=this_post, user=request.user)
    new_like.save()
    # Increment number of likes
    this_post.num_likes += 1
    this_post.save()
    return HttpResponseRedirect(reverse('uploader:view', args=(post_id,)))


def follow(request, user_id, post_id): # remove post_id and instead redirect to user page
    this_user = get_object_or_404(User,pk=user_id)
    request.user.user_set.add(this_user) 
    if post_id == 0:
        return userPage(request, this_user)
    return HttpResponseRedirect(reverse('uploader:view', args=(post_id,)))


def unfollow(request, user_id, post_id): # remove post_id and instead redirect to user page
    this_user = get_object_or_404(User,pk=user_id)
    request.user.user_set.remove(this_user)  
    if post_id == 0:
        return userPage(request, this_user)  
    return HttpResponseRedirect(reverse('uploader:view', args=(post_id,)))

def view(request, post_id):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    post = get_object_or_404(Post, id=post_id)
    comments = post.comment_set.order_by('creation_datetime')
    is_followed = request.user.user_set.filter(id=post.user.id).exists()
    is_liked = Like.objects.filter(post=post, user=request.user).exists()
    #check for null
    return render(request, 'uploader/view.html', {'post':post,'comments': comments, 'is_followed':is_followed, 'is_liked': is_liked})

def predict(request, post_id):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    post = Post.objects.get(id__exact=post_id)
    #Code incorporated from ImageAI (OlafenwaMoses)
    path = "media/"+str(post.id)+post.img_ext
    count=7
    model = pred.gen_predictor(0)
    try:
        predicts, percents = model.predictImage(path, result_count=count)
    except:
        print("Prediction Failed From TF Error: Reloading Model")
        pred.gen_predictor.cache_clear()
        model = pred.gen_predictor(0)
        predicts, percents = model.predictImage(path, result_count=count)

    lst=[]

    for i in range(len(predicts)):
        if percents[i] > 0.1:
            lst.append((predicts[i].replace('_',' '),str(round(percents[i], 2))))
    return render(request, 'uploader/view.html', {'post':post, 'pairs':lst})

def searchfor(request, query):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    posts = Post.objects.filter(Q(tags__icontains=query)|Q(caption__icontains=query))
    users = User.objects.filter(username__icontains=query)
    return render(request, 'uploader/search.html', {'posts': posts,'users':users})

def selfPage(request):
    if request.user.is_authenticated:
        return userPage(request, request.user)
    else:
        return redirect(reverse('insta:login'))
        
def userPage(request, name):
    if not request.user.is_authenticated:
        return redirect(reverse('insta:login'))
    user = get_object_or_404(User, username=name)
    posts= user.post_set.order_by("-creation_datetime")
    is_followed = request.user.user_set.filter(id=user.id).exists()
    print(is_followed)
    return render(request, 'uploader/user.html', {'user':user, 'posts':posts, 'is_followed':is_followed})