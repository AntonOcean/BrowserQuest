# BrowserQuest Game: Business Logic and Game Rules

## Overview
BrowserQuest is an HTML5/JavaScript multiplayer game that demonstrates real-time gameplay in web browsers. Players control characters in a shared world where they can explore, fight monsters, collect items, and interact with other players.

## Technical Architecture

### Client-Server Model
- **Server**: Node.js backend handling game state, physics, and entity management
- **Client**: HTML5/JavaScript frontend rendering the game world and handling player input
- **WebSocket Protocol**: Provides real-time bidirectional communication between clients and server
- **JSON/BISON**: Messages are serialized using JSON (or optionally BISON for compression)

### Directory Structure
- **/server**: Contains server-side code
  - **/js**: Server JavaScript files
  - **/maps**: Map data for the server
  - **/config.json**: Server configuration
- **/client**: Contains client-side code
  - **/js**: Client JavaScript files
  - **/css**: Styling
  - **/maps**: Map data for the client
  - **/sprites**: Character and item sprites
  - **/audio**: Sound effects and music
- **/shared**: Code shared between client and server
  - **/js/gametypes.js**: Constants and enums used by both client and server

## Core Components

### Server Architecture
- **WorldServer**: Main game server that manages the game world, entities, and player connections
  - Creates and manages all entity instances
  - Handles player connections and disconnections
  - Processes game logic and updates
  - Broadcasts state changes to clients
- **WebSocket Communication**: Handles real-time bidirectional communication between clients and server
  - Supports multiple WebSocket protocol versions
  - Handles message serialization/deserialization
  - Manages connection state
- **Zoning System**: Divides the map into groups/zones to optimize network traffic 
  - Each zone contains a subset of the game entities
  - Players only receive updates about entities in adjacent zones
  - Significantly reduces bandwidth requirements
- **Entity Management**: Tracks all entities (players, mobs, items, NPCs) in the game world
  - Unique IDs for all entities
  - Position tracking
  - State management

### Class Hierarchy
1. **Entity (entity.js)**
   - Base class for all game objects
   - Properties: id, position, kind, group
   - Methods: movement, destruction, group membership

2. **Character (character.js)**
   - Extends Entity
   - Properties: health, orientation, attacking status
   - Methods: attack, receive damage, heal
   
   - **Player (player.js)**
     - Extends Character
     - Properties: inventory, equipment, name, experience
     - Methods: pickup items, equip/unequip, chat
   
   - **Mob (mob.js)**
     - Extends Character
     - Properties: aggro range, respawn point, loot table
     - Methods: AI logic, aggro management, respawn
   
   - **NPC (npc.js)**
     - Extends Character
     - Properties: dialog options, quest data
     - Methods: interact with player

3. **Item (item.js)**
   - Extends Entity
   - Properties: item type, stats, requirements
   - Methods: pickup, equip effects
   
   - **Chest (chest.js)**
     - Extends Item
     - Properties: contents, state (open/closed)
     - Methods: open, generate loot

### Map and World Management
- **Map (map.js)**: Represents the game world
  - Collision grid for movement restrictions
    - Binary matrix indicating which tiles are walkable
    - Used for pathfinding and movement validation
  - Zone groups for network optimization
    - Map is divided into rectangular zones (default: 28x12 tiles per zone)
    - Entities are grouped by zone location
    - Adjacent zones are computed for efficient updates
  - Mob spawn areas
    - Defined regions where monsters appear
    - Contains spawn rates and mob types
  - Chest spawn areas
    - Regions where chests can appear
    - Contains loot tables and respawn times
  - Checkpoints and starting areas
    - Safe zones where players respawn
    - Initial starting positions for new players

- **MobAreas (mobarea.js)**: Designated regions where mobs spawn
  - Each area has specific mob types and quantities
    - Mob types defined by constants in gametypes.js
    - Population density controls
  - Mobs respawn when killed
    - Respawn timers based on mob type
    - Maximum population caps

- **ChestAreas (chestarea.js)**: Regions where chests can spawn
  - Chests contain random items based on predefined loot tables
    - Item generation follows rarity distributions
    - Different areas can have different loot quality

### Entity Interaction System
- **Pathfinding (pathfinder.js)**
  - A* algorithm for entity movement
  - Path caching for performance
  - Grid-based collision detection
  
- **Collision Detection**
  - Tile-based primary collision system
  - Entity-to-entity secondary collision
  - Different collision rules based on entity types

### Combat System
- **Health Points**: Characters have HP that depletes when damaged
  - Maximum health based on character type/level
  - Health regeneration over time
  
- **Attacking**: Characters can attack others within range
  - Attack range varies by weapon
  - Attack speed limitations
  - Damage calculation based on weapon and armor
  
- **Aggro Management**: 
  - Mobs track which players attacked them (hate list)
    - Stores player IDs and damage amounts
    - Sorted by total damage dealt
  - Mobs pursue the player who dealt the most damage
    - Pathfinding to reach target player
    - Maximum pursuit distance from spawn
  - Mobs will switch targets based on damage received
    - Target recalculation after threshold damage
    - Aggro radius for detecting nearby players

- **Death System**:
  - When a mob dies, it may drop items
    - Loot tables define drop probabilities
    - Random item generation
  - When a player dies, they respawn at checkpoints
    - Health reset
    - Death penalty (none in current implementation)
  - Dead entities are removed from the world
    - Cleanup of references
    - Broadcast of death to nearby players

### Item and Loot System
- **Item Types**: Various types of items (weapons, armor, potions)
  - Defined in gametypes.js
  - Different visual representations
  - Different effects when used/equipped
  
- **Item Properties**: Different stats and effects
  - Damage for weapons
  - Defense for armor
  - Health restoration for potions
  
- **Chest Mechanics**: 
  - Players can open chests to receive random items
    - Interaction distance check
    - Animation sequence
  - Chests despawn after being opened
    - Timeout for removal
    - Broadcast to nearby players
  - Static chests are placed at fixed locations
    - Defined in map data
    - Can have predefined contents
  - Dynamic chests respawn in designated areas
    - Timer-based respawn
    - Random position within area

- **Loot Drops**: 
  - Mobs drop items based on probability tables
    - Different mobs have different loot tables
    - Rarity tiers affect drop rates
  - Items despawn after a period if not collected
    - Cleanup timer for uncollected items
    - Prevents world clutter

### Player Progression
- Players can collect better equipment to increase their strength
  - Weapon upgrades increase damage
  - Armor upgrades increase defense
- No explicit leveling system, progression is gear-based
  - Equipment quality determines player power
  - Allows for horizontal progression

## Network Communication

### Message System
- **Serialized Messages**: All game events are sent as serialized messages
  - Message structure defined in message.js
  - Serialization/deserialization methods
  
- **Message Types**:
  - Spawn: New entity appearance
    - Contains entity type, position, and properties
  - Despawn: Entity removal
    - Contains entity ID
  - Move: Entity movement
    - Contains entity ID and new position
  - Attack: Combat actions
    - Contains attacker ID, target ID, damage
  - Health: HP updates
    - Contains entity ID and health value
  - Damage: Damage indicators
    - Contains position and amount for visual effects
  - Chat: Player communication
    - Contains sender ID and message content
  - Population: World population updates
    - Contains count of active players

### Socket Implementation
- **Abstraction Layer**: Supports different WebSocket libraries
  - ws.js provides a common interface
  - Handles fallbacks for older browsers
  - Error management and reconnection logic

### Optimization Techniques
- **Group-based Updates**: Players only receive updates for entities in adjacent zones
  - Significantly reduces message volume
  - Dynamic group assignment as players move
  
- **Queue System**: Outgoing messages are batched for efficiency
  - Messages collected in per-player queues
  - Sent in batches based on update cycle
  - Reduces network overhead
  
- **Relevance Filtering**: Only sending data relevant to each player
  - Distance-based filtering for events
  - Priority system for important events
  - Visibility checks for entities

## Game Loop and Update Cycle
- Server runs at a fixed updates-per-second rate (default: 50 UPS)
  - Configured in worldserver.js
  - Consistent timing for physics and game logic
  
- Health regeneration happens at a fixed interval
  - Percentage-based healing
  - Applies to all character entities
  
- Entity positions are updated and broadcast to relevant players
  - Movement validation against collision grid
  - Position synchronization between players
  
- Messages are processed in batches
  - Collection phase during update cycle
  - Dispatch phase at the end of cycle
  - Optimized for network efficiency

## Client Implementation
- **Rendering**: Canvas-based 2D rendering
  - Layers for background, entities, and foreground
  - Sprite-based animation system
  - Camera tracking player position

- **Input Handling**: 
  - Mouse movement for player direction
  - Click to move or attack
  - Key commands for actions

- **Game State**: 
  - Client-side prediction
  - Server reconciliation
  - Interpolation for smooth movement

## Player Experience
- Players can:
  - Move around the world using point-and-click navigation
  - Attack monsters by clicking on them
  - Collect items by walking over them
  - Open chests by clicking on them
  - Chat with other players using the chat interface
  - See other players in the same area in real-time
  - Progress by finding better equipment

## Advanced Game Mechanics
- **Respawn System**: 
  - Mobs have spawn points they return to if they move too far
  - Dynamic spawn timing based on area population
  
- **Group Dynamics**:
  - Implicit grouping when multiple players attack the same mob
  - Shared loot opportunities
  
- **Combat Balance**:
  - Different weapons have different ranges and damages
  - Some mobs are more dangerous than others
  - Boss encounters require better equipment

## Future Enhancement Opportunities
- Addition of quests and missions
  - Quest system framework
  - NPC dialog system expansion
  - Quest rewards and progression
  
- Expanded item and equipment system
  - More weapon and armor types
  - Item enchantments or modifications
  - Inventory management improvements
  
- Character progression/leveling
  - Experience points system
  - Skills and abilities
  - Character classes or specializations
  
- Enhanced combat mechanics
  - Special attacks and abilities
  - Status effects (poison, stun, etc.)
  - Tactical positioning importance
  
- Expanded world with different biomes/zones
  - Environmental hazards
  - Weather effects
  - Day/night cycle
  
- Player achievements and statistics
  - Tracking of accomplishments
  - Leaderboards
  - Social features

## Performance Considerations
- **Memory Management**:
  - Entity cleanup to prevent memory leaks
  - Object pooling for frequently created/destroyed objects
  
- **Network Optimization**:
  - Message compression
  - Bandwidth usage monitoring
  - Throttling mechanisms for high-load situations
  
- **Server Scaling**:
  - Multiple world instances
  - Load balancing
  - Horizontal scaling with multiple server processes 