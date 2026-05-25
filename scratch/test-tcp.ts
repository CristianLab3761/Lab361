import net from 'net';

const client = net.createConnection({ host: '2600:1f1e:75b:4b04:1ae0:27a1:e047:475f', port: 5432 }, () => {
  console.log('Successfully connected to the database port via IPv6!');
  client.end();
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});
