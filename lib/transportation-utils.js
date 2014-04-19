/*
 * transportation-utils
 * https://github.com/ralucas/transportation-utils.git
 *
 * Copyright (c) 2014 Richard Lucas
 * Licensed under the MIT license.
 */

'use strict';

var moment = require('moment-timezone'),
    _      = require('underscore');

// Converts radii to distance
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

/**
* Function for calculating distance
*
* param {object} geolocation hash
* param {object} stops hash
*
* returns {array} passed in stops that are within
*     passed in geolocation difference from
**/
exports.calculateDistance = function (geolocation, stops) {
    var distanceFrom = Number,
        R = 3959, // m
        latitude = parseInt(geolocation.latitude, 10),
        longitude = parseInt(geolocation.longitude, 10),
        output = [];

    _.each(stops, function(stop) {
        var stopLat = parseInt(stop['stop_lat'], 10),
            stopLon = parseInt(stop['stop_lon'], 10),
            latitudeDiff = (stopLat - latitude).toRad(),
            longitudeDiff = (stopLon - longitude).toRad();
        var a = Math.sin(latitudeDiff / 2) * Math.sin(latitudeDiff / 2) +
            Math.cos(latitude.toRad()) *
            Math.cos(stopLat.toRad()) *
            Math.sin(longitudeDiff / 2) * Math.sin(longitudeDiff / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        stop['distance'] = Math.round(d*100)/100;
        if( stop['distance'] <= geolocation['distanceFrom'] ) {
            output.push(stop);
        }
    });
    return output;
};

/**
* TODO: need function to match output of calculate distance 
* to actual stop times
*
*
*
*
**/
exports.selectedStopTimes = function(selectedStops) {
    var i = 0,
        stopIds = [],
        output = [];
    stopIds = _.pluck(selectedStops, 'stop_id');
    var lenStopId = stopIds.length;

    for( i; i < lenStopId; i+=1 ) {
        var id = stopIds[i];
        if(selectedStops[id]) {
            output.push(selectedStops[id]);
        }
    }
    return output;
};

/**
* Function to determine closest times given the geolocation data
*    and the selected stops from the selectedStopTimes function
*
*
* param {object} options - hash that requires timezone and minutes offset
*
**/
exports.closestTimes = function(geolocation, selectedStops, options) {
    var output = [];
    var localTime = moment.tz(geolocation.time, options.timezone).format('HH:mm:ss');
    var timeDifference = moment.tz(geolocation.time, options.timezone).add('m', options.minutes).format('HH:mm:ss');

    _.each(selectedStops, function(selectedStop) {
        if(( selectedStop['arrival_time'] > localTime )  && ( selectedStop['arrival_time'] < timeDifference )) {
            output.push(selectedStop);
        }
    });
    return output;
};
