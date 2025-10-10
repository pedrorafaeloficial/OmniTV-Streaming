sub init()
    m.label = m.top.findNode("label")
    m.top.observeField("content", "onContent")
end sub

sub onContent()
    if m.top.content <> invalid then
        m.label.text = m.top.content.title
    end if
end sub
