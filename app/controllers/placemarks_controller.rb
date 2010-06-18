class PlacemarksController < ApplicationController
  def index
    @placemarks = Placemark.paginate :page => params[:page], :per_page => 10
  end
  
  def new
    @place = Place.new
    @placemark = Placemark.new
  end
  
  def create
    params[:placemark][:user_id] = current_user.id
    
    @place = Place.new(params[:place])
    @place.rate(params[:stars], current_user, params[:dimension])
    @placemark = Placemark.new(params[:placemark])
    
    if @place.save
      @placemark.place_id = @place.id
    else
      render :action => 'new' and return
    end
    
    if @placemark.save
      flash[:notice] = "Successfully created placemark."
      redirect_to placemarks_url
    else
      render :action => 'new'
    end
  end
  
  def edit
    @placemark = Placemark.find(params[:id])
    @place = @placemark.place
  end
  
  def update
    @placemark = Placemark.find(params[:id])
    if @placemark.update_attributes(params[:placemark]) and \
      @placemark.place.update_attributes(params[:place])
      flash[:notice] = "Successfully updated placemark."
      redirect_to placemarks_url
    else
      render :action => 'edit'
    end
  end
  
  def destroy
    @placemark = Placemark.find(params[:id])
    @placemark.destroy
    flash[:notice] = "Placemark has been deleted."
    redirect_to :action => 'index'
  end
  
  def add
    @place = Place.new
    @placemark = Placemark.new
    
    #uri = URI.parse(params[:url])
    url = URI.split(params[:url])[2..-1].join
    @results = GoogleSearch.map_search(:q => url, :near => current_user.preferred_location)
    unless @results.blank?
      @placemark.alias = @results.andand.first['title']
      @place.name = @results.andand.first['title']
      @place.url = params[:url]
      @place.address = @results.andand.first['address']
      @place.phone_number = @results.andand.first['telephone']
    end   
  end
  
  def add_bk
    unless params[:url].blank?
      place = Place.new(:url => params[:url])
      if place.save
        current_user.places << place
      else
        flash[:failure] = "Fail to save."
      end
    else
      flash[:notice] = "There is no URL."
    end
    redirect_to root_url
  end

  def add_result
    @place = Place.new
    @place.add_from_result(params)
    @placemark = Placemark.new
    
    if @place.save and current_user
      @placemark.place_id = @place.id
      @placemark.user_id = current_user.id
      @placemark.alias = @place.name
      flash[:notice] = "Placemark saved." if @placemark.save
    end
    redirect_to :back 
  end
end
