class PlacesController < ApplicationController
  def index
    @places = Place.all
  end
  
  def new
    @place = Place.new
  end
  
  def create
    @place = Place.new(params[:place])
    if @place.save
      flash[:notice] = "Successfully created place."
      redirect_to places_url
    else
      render :action => 'new'
    end
  end
  
  def edit
    @place = Place.find(params[:id])
  end
  
  def update
    @place = Place.find(params[:id])
    if @place.update_attributes(params[:place])
      flash[:notice] = "Successfully updated place."
      redirect_to places_url
    else
      render :action => 'edit'
    end
  end
  
  def rate
    @place = Place.find(params[:id])
    @place.rate(params[:stars], current_user, params[:dimension])
    id = "ajaxful-rating-#{ !params[:dimension].blank? ? "#{params[:dimension]}-" : ''}place-#{@place.id}"
    render :update do |page|
      page.replace_html id, ratings_for(@place, :wrap => false, 
                                                :dimension => params[:dimension], 
                                                :small_stars => true)
      page.visual_effect :highlight, id
    end
  end
  
  def nonajax_rate
    @place = Place.new
    @place.rate(params[:stars], current_user, params[:dimension])
    id = "ajaxful-rating-#{ !params[:dimension].blank? ? "#{params[:dimension]}-" : ''}place-#{@place.id}"
    render :update do |page|
      #page.replace_html "current-rating", params[:stars]
      #page.replace_html "stars", params[:stars]
      #page.replace_html "dimension", params[:dimension]
      page.replace_html id, ratings_for(@place, :wrap => false, 
                                                :dimension => params[:dimension], 
                                                :small_stars => true, 
                                                :remote_options => {:url => nonajax_rate_places_path })
      #page.visual_effect :highlight, id
    end
  end
end
