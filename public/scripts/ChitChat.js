class ChitChat {
    constructor(socket, username) {
        this.onlineCount = 0
        this.socket = socket
        this.username = username
        this.sendUserInfo()
        this.setupEvents()
    }

    setupEvents() {
        this.setupUserConnectEvent()
        this.setupUserDisconnectEvent()
        this.setupSendMessageEvent()
        this.setupReceiveMessageEvent()
    }

    sendUserInfo() {
        const userInfo = {
            'username' : this.username
        }
        this.socket.emit('userInfo', userInfo)
    }

    addMessageToConversationTable(messagePayLoad) {
        if (messagePayLoad.username === this.username) {
            messagePayLoad.username = 'you'
        }
        const markup = '<tr><td>' +
        messagePayLoad.username +
        '</td><td>' +
        messagePayLoad.message +
        '</td><td>' +
        messagePayLoad.date +
        '</td></tr>'
        $('#conversationTable tbody').append(markup)
    }

    addUserToOnlineTable(userInfo) {
        const markup = '<tr align="center" id = ' + userInfo.id + '><td>' +
        userInfo.username +
        '</td></tr>'
        $('#onlineTable tbody').append(markup)
    }

    setOnlineCountDisplay() {
        if (this.onlineCount < 0) {
            throw "something went wrong!!!"
            this.onlineCount = 0
        }
        let onlineStr = ''
        if (this.onlineCount === 1) {
            onlineStr = '1 user online'
        } else {
            onlineStr = this.onlineCount + ' users online'
        }
        $('#onlineCount').text(onlineStr)
    }

    setupUserConnectEvent() {
        this.socket.on('userConnectNotification', (userInfo) => {
            this.onlineCount += 1
            this.addUserToOnlineTable(userInfo)
            this.setOnlineCountDisplay()
        })
    }

    removeUserFromOnlineTable(userInfo) {
        $('#' + userInfo.id).remove()
    }

    setupUserDisconnectEvent() {
        this.socket.on('userDisconnectNotification', (userInfo) => {
            this.onlineCount -= 1
            this.removeUserFromOnlineTable(userInfo)
            this.setOnlineCountDisplay()
        })
    }

    sendMessage(message) {
        const messagePayLoad = {
            'message' : message,
            'username' : this.username,
            'date' : new Date()
        }
        this.socket.emit('messagePayLoad', messagePayLoad)
        this.addMessageToConversationTable(messagePayLoad)
    }

    setupSendMessageEvent() {
        $('#sendButton').click(() => {
            const message = $.trim($('#message').val())
            if (message) {
                this.sendMessage(message)
            }
            $('#message').val('')
        })
    }

    setupReceiveMessageEvent() {
        this.socket.on('messagePayLoad', (messagePayLoad) => {
            this.addMessageToConversationTable(messagePayLoad)
        })
    }
}
