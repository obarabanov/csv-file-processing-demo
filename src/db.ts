const sqlite3 = require('sqlite3').verbose();

export const db = new sqlite3.Database(':memory:');
export let stmtInsertContact;

/**
 * Bootstrapping DB.
 */
db.serialize(function () {
    db.run(`CREATE TABLE contacts (
      firstname TEXT,
      lastname TEXT,
      email TEXT
      )`);
    stmtInsertContact = db.prepare("INSERT INTO contacts VALUES (?, ?, ?)");

    /*
    // testing
    for (var i = 0; i < 4; i++) {
        stmtInsertContact.run(`firstname${i}`, `lastname${i}`, `email${i}`);
    }
    stmtInsertContact.finalize();
  
    db.each("SELECT rowid AS id, firstname, lastname, email FROM contacts", function(err, row) {
        console.log(`${row.id}: ${row.firstname} ${row.lastname} - ${row.email}`);
    });
    */
});

console.log(`SQLite DB runs in memory.`);
