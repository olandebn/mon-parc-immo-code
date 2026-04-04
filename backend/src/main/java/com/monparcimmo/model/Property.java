package com.monparcimmo.model;

import lombok.Data;
import java.util.List;

@Data
public class Property {
    private String id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private int maxGuests;
    private int numberOfRooms;
    private double surfaceArea;         // en m²

    // Photos principales
    private List<String> mainPhotoUrls;

    // Photos des alentours / extérieur
    private List<String> surroundingPhotoUrls;

    // Pièces avec leur équipement
    private List<Room> rooms;

    // Infos pratiques
    private String wifiPassword;
    private String electricMeterLocation;
    private String waterMeterLocation;
    private String parkingInfo;
    private String trashInfo;

    // Coordonnées GPS (pour afficher sur carte)
    private double latitude;
    private double longitude;
}
