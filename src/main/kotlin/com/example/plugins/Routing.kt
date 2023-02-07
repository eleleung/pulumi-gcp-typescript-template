package com.example.plugins

import com.example.DatabaseTest
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.application.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Hello World!")
        }
        post("/db") {
           val users = DatabaseTest().databaseTest()
            call.respondText(users.toString())
        }
    }
}
