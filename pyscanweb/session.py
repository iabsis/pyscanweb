class SessionScanedImagesManager(object):
    "Store scanned images name in the session"

    def __init__(self, request):
        self.request = request


    def session_add_image(self, image_name):
        """
        Add an image to the session collection
        """
        if not 'scanned_images' in self.request.session :
            self.request.session['scanned_images'] = [image_name]
        else :
            saved_list = self.request.session['scanned_images']
            saved_list.append(image_name)
            self.request.session['scanned_images'] = saved_list

    def get_session_images_list(self):
        """
        Return the whole list of scanned image for the current user
        """
        return self.request.session['scanned_images']

    def get_last_image(self):
        """
        Return the image name of the last scanned image
        """
        return self.get_session_images_list()[-1]

    def get_image(self, id):
        """
        Return the image saved on the list id
        """
        return self.get_session_images_list()[id]

    def clear(self):
        del(self.request.session['scanned_images'])
