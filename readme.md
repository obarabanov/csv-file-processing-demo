Functionality
----------

The application is a web page containing a form which allows the upload of a CSV file in the following format:

```First name, Surname, Email```

Such CSV file could contain any number of lines (potentially, it may be very long). 

Uploaded data then parsed and saved in a database (in-memory SQLite database used).

The data also displayed on a web page.


How to run
----------

```
npm install
npm run compile
npm start
```

Logs output will be pre-formatted to be readable.  

Testing
-------

To run integration test:

```npm test```

