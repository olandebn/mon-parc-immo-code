package com.monparcimmo.model;

import lombok.Data;
import java.util.List;

@Data
public class Room {
    private String id;
    private String name;           // ex: "Chambre principale", "Salon", "Cuisine"
    private String type;           // BEDROOM, LIVING_ROOM, KITCHEN, BATHROOM, etc.
    private String description;
    private List<String> equipment; // ex: ["TV", "Climatisation", "Lit double"]
    private List<String> photoUrls;
    private int floor;             // étage (0 = rez-de-chaussée)
}
