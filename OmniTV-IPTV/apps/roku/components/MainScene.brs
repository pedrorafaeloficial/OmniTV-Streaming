sub init()
    m.grid = m.top.findNode("grid")
    m.login = m.top.findNode("login")
    m.login.observeField("onLogin", "onLoginSuccess")
    m.grid.content = CreateHomeContent()
    m.login.visible = true
end sub

function CreateHomeContent() as Object
    content = CreateObject("roSGNode", "ContentNode")
    addItem(content, "TV Ao Vivo")
    addItem(content, "Filmes")
    addItem(content, "Séries")
    addItem(content, "Busca")
    addItem(content, "Configurações")
    return content
end function

sub addItem(parent as Object, title as String)
    item = CreateObject("roSGNode", "ContentNode")
    item.title = title
    parent.appendChild(item)
end sub

sub onLoginSuccess(event as Object)
    m.login.visible = false
    m.top.state = "home"
end sub
