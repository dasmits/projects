# InstaDan
An Instagram clone built for fun, and then used to satisfy course requirement in CSE 204: Web Development and CSE 503S: Rapid Prototype Development (Graduate Level) at Washington University in St. Louis. To avoid copyright infringement or plagiarism, I have kept these two project separate. 

## Visual Clone
The ![visual component](./visual clone (css)/) of InstaDan was built as a challenge of my CSS knowledge, and was built in vanilla HTML and CSS. All 'Uploaded' photos are my own, all user profile images belong to their respective users. 

![Visual Clone Example:](insta.gif)

## Functional Clone
The functional component of InstaDan was built using Django (Python) and MariaDB. It was  originally hosted on a customized AWS server. Along with Christian Shewmake, we recreated the following features: user profiles, secure login, static media server, image uploading, liking, commenting, following, tagging, feed customization, and image/user/tag searching. We augmented these features by adding rapid auto-tagging. Newly uploaded images awere proecssed by ResNet, a Convolutional Neural Network trained on the ImageNet dataset, and the top suggested tags (along with their softmaxed probabilities) were given to the user.
