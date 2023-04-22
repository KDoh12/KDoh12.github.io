# Redlining in Norfolk, Now vs Then

## Project

Here is the link to the project: [Redlining in Norfolk](https://kdoh12.github.io/redlining-norfolk)

Feel free to read below to understand where the data came from, how I created the map, and what I took away from this project.

## Data Sources

- The polygons for the redlined areas in Norfolk, VA were obtained as a GeoJSON file from [Mapping Inequality](https://dsl.richmond.edu/panorama/redlining/#loc=5/39.1/-94.58).
- 2019 Income, Housing, and Demographic data are from the 2019 ACS 5-Year Estimates and were downloaded from the [U.S. Census](https://data.census.gov/).
- Census Tracts used in process were downloaded from [U.S. Census](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html).

## What is Redlining?

According to the Oxford English Dictionary, redlining means to

> "refuse (a loan or insurance) to someone because they live in an area deemed to be a poor financial risk"

The following is how Wikipedia defines redlining:

> "In the United States, redlining is a discriminatory practice in which services (financial and otherwise) are withheld from potential customers who reside in neighborhoods classified as "hazardous" to investment; these neighborhoods have significant numbers of racial and ethnic minorities, and low-income residents."

I personally like the Wikipedia version as it broadens the potential impact of redlining by using the term "services (financial and otherwise)" whereas the dictionary leads one to belive that only loans and insurances can be withheld from an area. While withholding home loans and home insurance was heavily practiced in the 1930s, 40s, and 50s by the Home Owners Loan Corporation (HOLC), it is important to note that redlining can happen with many other types of services.

## Why?

I wanted to create this map so that people could explore the redlined areas of Norfolk, VA as well as try to show how redlining has impacted those same areas some 80 years later.

## Process

- Download data
  - First step was to download the GeoJSON for the redlined polygons and the census data. The census data I used was the 2019 ACS 5-Year Estimates as that was the most recent dataset that includes economic data at the census tract level.
- Clean the data
  - The next step was to clean up the census data as I only needed a few key pieces of data per census tract, I was not looking for everything that is included in the CSV. I also had to clean up the redlining data, in the GeoJSON, there is a single "description" field that actually contains a dictionary of Key:Values that are pulled from the area description forms that were submitted for each area back in 1940. I wanted to split this data up into separate columns so I could show individual attributes such as the income per area, owner-occupied percentage and the percentage of the population that was black. These forms specifically tracked the percentage of "Foreign Families, Nationalities, and Black people. Click [here](https://dsl.richmond.edu/panorama/redlining/#loc=11/36.914/-76.571&city=norfolk-va&area=C10&adimage=2/68.399/-207.773) for to see what these forms looked like.
- Calculate the percentages
  - Technically this is part of the data cleaning but I also had to manually calculate the percentages of various census data such as the minority population as a percentage of the total population of each tract.
- Calculate adjusted income using the [BLS Consumer Price Index (CPI) Calculator](https://data.bls.gov/cgi-bin/cpicalc.pl?cost1=1&year1=194001&year2=201901)
  - In order to try and relate the 1940 income data to the 2019 income data, I wanted to find the adjusted income value. In order to achieve this I used the Bureau of Labor Statics' Consumer Price Index calculator, which is linked above. Since I couldn't quickly type ever single attribute into the calculator, I found out how much $1 in 1940 would be worth today, which ended up being $18.11. I then used the field calculator and multiplied the 1940 income data by 18.11.
- Join census data to tracts
  - Once everything was cleaned and I had the fields and attributes I wanted, I joined the census csv data to the census tract polygons that I downloaded from the census. I was able to join them by the census tract name.
- Join attributes by location
  - The next step was to join the census data to the redlined polygons. This was challenging as these two polygons do not match. Some redlined polygons can span 2 or even 3 and 4 census tracts. The way I determined to express the census data that would represent that redlined area, was to take the attributes of whatever census tract the redlined area covers the most.
    - In order to achieve this I followed the workflow I found [here](https://gis.stackexchange.com/questions/295739/select-features-in-a-polygon-that-covered-the-most-by-features-of-another-polygo). (Thank you GIS Stack Exchange!) The workflow is a lot to describe in this section but essentially, it will allow you to determine which polygon of a different feature overlaps the most of another polygon in another feature. I see this as being very useful and encourage you to take a read.
- Export as GeoJSON
  - Once I had all the attributes in one layer, I exported that layer as a GeoJSON in the WGS84 CRS.
- Upload GeoJSON to Mapbox
  - Next step was to upload that GeoJSON to Mapbox as a dataset. I then took that dataset and exported it to a tileset.
- Create style
  - Once I had the tileset I thenc reated a new style using Mapbox Studio and got my map looking how I wanted.
- Create HTML files
  - Finally, I created an Index and Map .html files which are the final products of this project. You can view them [here](https://kdoh12.github.io/redlining-norfolk/)

## Conclusion

This project has broadened my knowledge of redlining and how it still effects areas today. There were many areas in 1940 Norfolk that were deemed as "Hazardous" or "Definitely Declining" that still suffer from disinvestment today. I would like to further explore this topic and try and find just how big of an impact redlining had on these areas and how they would've developed if disinvestment had not been promoted back then.

I think this project opens the way for further exploration and mapping of these areas to try and find other similarities, or to determine just how well some areas have improved, or how much areas have worsened for the inhabitants. I would love to map out healthcare and education demographics in the city or to research maybe how local laws and politics effect the differnt areas.
