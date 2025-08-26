START TRANSACTION;

UPDATE vehicles SET corridor = 'Beira' WHERE corridor = 'North';
UPDATE vehicles SET corridor = 'Nacala' WHERE corridor = 'South';
UPDATE vehicles SET corridor = 'Central (Dar es Salaam)' WHERE corridor = 'East';
UPDATE vehicles SET corridor = 'Durban' WHERE corridor = 'West';

COMMIT;