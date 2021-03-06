class SessionsController < ApplicationController
  include Geokit::Geocoders
  
  skip_before_filter :login_required
  
  def new
  end
  
  def create
    user = User.authenticate(params[:login], params[:password])
    if user
      set_geolocation(user)
      session[:user_id] = user.id
      flash[:notice] = "Logged in successfully."
      redirect_to session[:request_uri] || root_url
    else
      flash.now[:error] = "Invalid login or password."
      render :action => 'new'
    end
  end
  
  def destroy
    session[:user_id] = nil
    flash[:notice] = "You have been logged out."
    redirect_to root_url
  end
  
  private
    def set_geolocation(user)
      if user.preferred_location.blank?
        location = GeoIp.geolocation(request.remote_ip)
        session[:preferred_location] = location[:city]
        user.preferred_location = location[:city]
        user.save
      else
        session[:preferred_location] = user.preferred_location
      end
    end
    
end
