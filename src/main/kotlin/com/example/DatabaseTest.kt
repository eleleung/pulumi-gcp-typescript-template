package com.example

import com.example.db.ConnectorConnectionPoolFactory
import com.example.db.Service
import com.example.db.User
import io.koalaql.jdbc.JdbcDataSource
import javax.sql.DataSource

class DatabaseLoader {
    fun loadDatabase(dataSource: DataSource): JdbcDataSource {
            var dbSource = ConnectorConnectionPoolFactory.createConnectionPool()
    return ConnectorConnectionPoolFactory.mkJDBCDatabase(dbSource)
    }
}
class DatabaseTest {
    fun databaseTest(): Set<User> {
        val source = DatabaseLoader().loadDatabase(ConnectorConnectionPoolFactory.createConnectionPool())
        val service = Service(source)
        val users = service.createUsers(listOf(User("test1"), User("test2")))
        return service.fetchUsers()
    }
}