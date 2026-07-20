const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.jfgcblixkgkfyndexvhr',
  password: 'Mahad@6225425',
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to Supabase!');
    return client.end();
  })
  .catch(err => {
    console.error('FAILED:', err.message);
  });
