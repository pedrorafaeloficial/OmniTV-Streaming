sub init()
    m.host = m.top.findNode("host")
    m.user = m.top.findNode("user")
    m.pass = m.top.findNode("pass")
    m.submit = m.top.findNode("submit")
    m.submit.observeField("buttonSelected", "onSubmit")
end sub

sub onSubmit()
    creds = {
        host: m.host.text,
        username: m.user.text,
        password: m.pass.text
    }
    m.top.onLogin = creds
end sub
