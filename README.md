# 🚒 Fire Department Equipment Tracker

A web-based application for tracking fire department equipment across your service in real-time.

## Features

- **Add Equipment**: Easily add new equipment with detailed information
- **Real-time Tracking**: Live updates every 5 seconds to track equipment status
- **Search & Filter**: Quickly find equipment by name, type, location, or status
- **Status Management**: Track equipment as Available, In Use, Maintenance, or Out of Service
- **Local Database**: Uses IndexedDB for persistent storage directly in the browser
- **Statistics Dashboard**: View real-time counts of equipment by status
- **Edit & Delete**: Modify or remove equipment entries as needed
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Equipment Types Supported

- Hose
- Ladder
- Breathing Apparatus
- Protective Gear
- Vehicle
- Tool
- Communication Device
- Other

## How to Use

### Running the Application

1. **Simple Method**: Just open the `index.html` file in any modern web browser (Chrome, Firefox, Edge, Safari)
   - Double-click on `index.html` or right-click and select "Open with" your preferred browser

2. **Using a Local Server** (Recommended for best performance):
   - If you have Python installed:
     ```bash
     # Python 3
     python -m http.server 8000
     ```
   - If you have Node.js installed:
     ```bash
     # Install http-server globally
     npm install -g http-server
     
     # Run the server
     http-server
     ```
   - Then open your browser and go to `http://localhost:8000`

### Adding Equipment

1. Fill out the "Add New Equipment" form with:
   - Equipment Name (required)
   - Type (required)
   - Location (required)
   - Status (required)
   - Serial Number (optional)
   - Notes (optional)

2. Click "Add Equipment" button

3. The equipment will appear in the inventory list below

### Searching and Filtering

- **Search Box**: Type to search by name, type, location, or serial number
- **Status Filter**: Filter equipment by status (Available, In Use, Maintenance, Out of Service)
- **Type Filter**: Filter equipment by type

### Editing Equipment

1. Click the "Edit" button on any equipment card
2. The form will populate with the current information
3. Make your changes
4. Click "Add Equipment" (it will update instead of adding new)

### Deleting Equipment

1. Click the "Delete" button on any equipment card
2. Confirm the deletion
3. The equipment will be removed from the database

## Technical Details

### Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling with modern gradients and responsive design
- **JavaScript (ES6+)**: Application logic and database operations
- **IndexedDB**: Browser-based database for persistent storage

### Database Structure

The application uses IndexedDB with the following schema:

```javascript
{
  id: (auto-increment),
  name: string,
  type: string,
  location: string,
  status: string,
  serialNumber: string,
  notes: string,
  timestamp: ISO date string,
  lastUpdated: ISO date string
}
```

### Live Tracking

The application automatically refreshes the equipment list every 5 seconds to provide real-time tracking. This is useful when multiple users are accessing the application simultaneously (though IndexedDB is local to each browser).

## Browser Compatibility

- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Opera

**Note**: IndexedDB is supported in all modern browsers. Internet Explorer 10+ has partial support.

## Future Enhancements

Potential improvements for future versions:

1. **Backend Integration**: Connect to a server-side database (MySQL, PostgreSQL, MongoDB) for true multi-user support
2. **User Authentication**: Add login system for different user roles
3. **Export/Import**: Export data to CSV/Excel and import from files
4. **QR Code Integration**: Generate QR codes for equipment tracking
5. **Maintenance Scheduling**: Set up maintenance reminders and schedules
6. **Photo Upload**: Add equipment photos
7. **History Tracking**: Track all changes made to equipment
8. **Mobile App**: Native mobile applications for iOS and Android
9. **Barcode Scanner**: Scan equipment barcodes for quick lookup
10. **Reports**: Generate PDF reports of equipment inventory

## Upgrading to Server-Based Solution

To upgrade this to a multi-user server-based solution:

1. **Backend Options**:
   - Node.js with Express and MongoDB
   - Python with Flask/Django and PostgreSQL
   - PHP with Laravel and MySQL

2. **Replace IndexedDB calls** with API calls to your backend

3. **Add WebSocket support** for real-time updates across all users

4. **Implement authentication** and authorization

## Support

For issues or questions, please contact your IT department or the application developer.

## License

This application is provided as-is for use by fire departments and emergency services.

---

**Created**: December 2025
**Version**: 1.0.0
