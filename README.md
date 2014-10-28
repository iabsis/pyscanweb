# pyscan

Pyscan is a web interface that allows users to use the pyinsane library.

# Development

The dev_env does contain a lot of stuff to help you change CSS and JS files. All you have to do is to install grunt and launch the following commands :

```
cd dev_env
grunt watch
```

Note : If you don't want the gruntfile to upload file on a different server, you can edit the following line :

```tasks: ['compass', 'concat', 'concat_css', 'uglify', 'cssmin', 'sftp'],```

And replace by :

```tasks: ['compass', 'concat', 'concat_css', 'uglify', 'cssmin'],```

If you want your grunt able to upload file to your webserver, you must create a "secret.json" file with the following content :

```{
    "host" : "192.168.0.5",
    "username" : "root",
    "password" : "pfcqopfs"
}```

And then, update the Gruntfile.json according your server configuration


# Deployment
To be completed
