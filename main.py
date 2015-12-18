import os
import urllib

from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

import webapp2
import jinja2
import json

from cStringIO import StringIO
from splitpdf import split_pdf

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class GetUploadURL(webapp2.RequestHandler):
    def get(self):
        try:
            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(json.dumps({
                'url': blobstore.create_upload_url('/api/upload')
            }))
        except:
            self.error(500)


class FileUploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            upload = self.get_uploads()[0]

            self.response.headers['Content-Type'] = 'application/json'
            obj = {
                'url': '/file/%s' % upload.key()
            }
            self.response.out.write(json.dumps(obj))
        except:
            self.error(500)

class ViewFileHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, file_key, file_name, seq):
        self.request.body
        if not blobstore.get(file_key):
            self.error(404)
        else:
            breader = blobstore.BlobReader(file_key)
            bcontent = StringIO(breader.read())
            ws = StringIO()

            self.response.headers['Content-Type'] = 'application/octet-stream'
            self.response.headers['Content-Disposition'] = 'attachment; filename="{0}"'.format(file_name)

            nseq = [int(i) for i in seq.split(',')]
            r = int(nseq[0])
            c = len(nseq[1:]) / r
            split_pdf(bcontent, ws, r, c, nseq[1:])
            ws.seek(0)
            self.response.out.write(ws.read())
            blobstore.delete(file_key)

app = webapp2.WSGIApplication([
    ('/api/upload', FileUploadHandler),
    ('/api/uploadURL', GetUploadURL),
    ('/file/([^/]+)?/([^/]+)?/([^/]+)?', ViewFileHandler),
], debug=True)
