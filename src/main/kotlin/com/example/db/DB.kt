package com.example.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.koalaql.DeclareStrategy
import io.koalaql.JdbcSchemaDetection
import io.koalaql.data.JdbcMappedType
import io.koalaql.data.JdbcTypeMappings
import io.koalaql.event.DataSourceEvent
import io.koalaql.jdbc.JdbcDataSource
import io.koalaql.jdbc.JdbcProvider
import io.koalaql.postgres.PostgresDialect
import java.sql.Connection
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.Timestamp
import java.time.Instant
import javax.sql.DataSource


object ConnectorConnectionPoolFactory {
    fun createConnectionPool(): HikariDataSource {
        // The configuration object specifies behaviors for the connection pool.
        val config = HikariConfig()

        // Configure which instance and what database user to connect with.
        // Configure which instance and what database user to connect with.
        config.jdbcUrl = String.format("jdbc:postgresql://%s:%s/%s", "claimer-dev-one:europe-west2:sql-instance-a00ea7f", "5432", "claimer-database")
        config.username = "admin" // e.g. "root", "postgres"
        config.password = "password" // e.g. "my-password"


        // The ipTypes argument can be used to specify a comma delimited list of preferred IP types
        // for connecting to a Cloud SQL instance. The argument ipTypes=PRIVATE will force the
        // SocketFactory to connect with an instance's associated private IP.
        config.addDataSourceProperty("ipTypes", "PUBLIC,PRIVATE")

        // ... Specify additional connection properties here.
        // ...

        // Initialize the connection pool using the configuration object.
        return HikariDataSource(config)
    }

    fun mkJDBCDatabase(dataSource: HikariDataSource): JdbcDataSource =
        JdbcDataSource(
            JdbcSchemaDetection.NotSupported,
            PostgresDialect(),
            object : JdbcProvider {
                override fun connect(): Connection = dataSource.connection
                override fun close() {
                    dataSource.close()
                }
            },
            postgresTypeMappings(),
            DeclareStrategy.CreateIfNotExists,
            DataSourceEvent.DISCARD
        )
}

public fun postgresTypeMappings(): JdbcTypeMappings {
    val result = JdbcTypeMappings()

    result.register(
        Instant::class,
        object : JdbcMappedType<Instant> {
            override fun writeJdbc(stmt: PreparedStatement, index: Int, value: Instant) {
                stmt.setTimestamp(index, Timestamp.from(value))
            }

            override fun readJdbc(rs: ResultSet, index: Int): Instant? {
                return rs.getTimestamp(index).toInstant()
            }
        }
    )

    return result
}