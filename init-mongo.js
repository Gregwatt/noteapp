db.createUser({
    user: 'noteuser',
    pwd: 'notepass',
    roles: [
        { role: 'readWrite', db: 'noteapp' }
    ]
})