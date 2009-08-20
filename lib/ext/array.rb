class Array
  def median
    if length.odd?
      self[length / 2.0]
    else
      self[(length / 2 - 1)..(length / 2)].average
    end
  end
  
  def average
    sum / length
  end
end