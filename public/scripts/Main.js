$(() => {
    new MyApp(ChitChat)
})

class MyApp {
    constructor(App) {
        this.getUserName()
        this.socket = io()
        this.game = new App(this.socket, this.username)
    }

    getUserName() {
        let username = ""
        const randomNumber = Math.floor(Math.random() * 10000000)
        const defaultVal = "user" + randomNumber.toString()
        while (username.trim() === "") {
            username = prompt("Please enter your name", defaultVal)
        }
        this.username = username
        const h1Text = $("h1").append(" <u>"+ username +"</u>")
    }
}
