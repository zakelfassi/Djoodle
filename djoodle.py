from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
import os

class DjoodleApp(webapp.RequestHandler):
  def get(self):
    path = os.path.join(os.path.dirname(__file__), 'index.html')
    template_values = {
        'gdayname': 'g|Senegal',
    }
    self.response.out.write(template.render(path, template_values))

application = webapp.WSGIApplication(
                                     [('/', DjoodleApp)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()