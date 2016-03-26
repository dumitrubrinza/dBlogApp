<h3>Git link </h3> <a href="https://github.com/dumitrubrinza/dBlogApp.git">dBlogApp</a>
<br>
<p>As you notice there is `bower.json` file that contains all dependencies that can be installed by <b>`bower install`</b> command, however I deploied the app with dependencies allready installed (see <b> `dBlogApp/bower_components`</b>) </p>
<p><h4>!! No need to install dependencies !!</h4></p>
<p>The app itself represent a Blog App, that require further development (at this stage the app is at the development stage)</p>
<p>There is no server side (backend) of the application yet</p>
***
<h5>To run the app localy run the <b> `http-server` </b> command</h5>
<p>Even though the app contains user authentication throught the Cookies that store the Base64 encoded username and the password, and this are hold even after the browser refresh </p>
***
<p>User service contains already some users information that can be used for logging in</p>
```javascript
1.                       2.                   3. 
username: Homer          username: Bart       username: Marge
password: secret         password: secret     password: secret
```