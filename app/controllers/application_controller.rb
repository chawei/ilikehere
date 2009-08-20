# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include Authentication
  include Geokit::Geocoders
  
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  filter_parameter_logging :password
  
  before_filter :set_geolocation
  
  def set_geolocation
    ip_addr = request.env['REMOTE_ADDR']
    location = IpGeocoder.geocode('ip_addr')
    puts location
  end
end
