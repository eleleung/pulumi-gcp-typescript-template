package com.example.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.koalaql.DeclareStrategy
import io.koalaql.JdbcSchemaDetection
import io.koalaql.ddl.INTEGER
import io.koalaql.ddl.TEXT
import io.koalaql.ddl.TIMESTAMP
import io.koalaql.ddl.Table
import io.koalaql.ddl.Table.Companion.autoIncrement
import io.koalaql.ddl.Table.Companion.default
import io.koalaql.ddl.Table.Companion.primaryKey
import io.koalaql.ddl.VARCHAR
import io.koalaql.dsl.currentTimestamp
import io.koalaql.event.DataSourceEvent
import io.koalaql.jdbc.JdbcDataSource
import io.koalaql.jdbc.JdbcProvider
import io.koalaql.postgres.PostgresDialect
import java.sql.Connection
import java.time.Duration

public data class DatabaseConfig(
    val host: String = "claimer-dev-one:europe-west2:sql-instance-a00ea7f",
    val username: String = "admin",
    val password: String = "password" ,
    val databaseName: String = "claimer-database"
)

object UserTable: Table("usernames") {
    val id = column("id", INTEGER.autoIncrement().primaryKey())
    val username = column("username", VARCHAR(128))
}