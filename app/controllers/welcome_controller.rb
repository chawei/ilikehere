class WelcomeController < ApplicationController
  def index
    unless current_user.nil?
      @placemarks = current_user.placemarks.paginate :page => params[:page], :per_page => 10
    end
  end
end
