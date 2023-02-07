package com.example.db

import io.koalaql.dsl.alias
import io.koalaql.dsl.as_
import io.koalaql.dsl.coalesce
import io.koalaql.dsl.count
import io.koalaql.dsl.cte
import io.koalaql.dsl.eq
import io.koalaql.dsl.exists
import io.koalaql.dsl.label
import io.koalaql.dsl.rowOf
import io.koalaql.dsl.value
import io.koalaql.dsl.values
import io.koalaql.jdbc.JdbcDataSource
import io.koalaql.transact

data class User(
    val username: String
)

class Service(
    private val db: JdbcDataSource
) {
    init {
        db.declareTables(UserTable)
    }

    fun createUsers(users: List<User>): List<Int> = db.transact { cxn ->
        UserTable
            .insert(values(users) {
                set(UserTable.username, it.username)
            })
            .generatingKey(UserTable.id)
            .perform(cxn)
            .toList()
    }

    fun fetchUsers(): Set<User> {
        return db.transact { cxn ->
            UserTable
                .selectAll()
                .perform(cxn)
                .map { row ->
                    User(
                        username = row[UserTable.username]
                    )
                }
                .toSet()
        }
    }



}