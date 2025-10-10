sub init()
    m.video = m.top.findNode("video")
    m.top.observeField("streamUrl", "onStreamUrl")
end sub

sub onStreamUrl()
    if m.top.streamUrl <> invalid and m.top.streamUrl <> "" then
        content = CreateObject("roSGNode", "ContentNode")
        content.streamformat = "hls"
        content.url = m.top.streamUrl
        m.video.control = "play"
        m.video.content = content
    end if
end sub
