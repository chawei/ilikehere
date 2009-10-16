class UsersController < ApplicationController
  
  skip_before_filter :login_required, :only => [:new, :create]
  
  def profile
    unless @current_user = current_user
      flash[:notice] = "Please login first!"
      redirect_to root_url
    end
  end
  
  def new
    @user = User.new
  end
  
  def create
    @user = User.new(params[:user])
    if @user.save
      session[:user_id] = @user.id
      flash[:notice] = "Thank you for signing up! You are now logged in."
      redirect_to root_url
    else
      render :action => 'new'
    end
  end
  
  def edit
    @user = current_user
  end
  
  def update
    @user = current_user
    if @user.update_attributes(params[:user])
      flash[:notice] = "Successfully updated your profile."
      redirect_to :action => :profile
    else
      render :action => :edit
    end
  end
end
