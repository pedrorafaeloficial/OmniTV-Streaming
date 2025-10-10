function XtreamRequest(path as String, params as Object) as Object
    url = path + "?" + BuildQuery(params)
    transfer = CreateObject("roUrlTransfer")
    transfer.SetCertificatesFile("common:/certs/ca-bundle.crt")
    transfer.SetURL(url)
    response = transfer.GetToString()
    if response = invalid then return invalid
    return ParseJson(response)
end function

function BuildQuery(params as Object) as String
    result = []
    for each key in params
        result.Push(key + "=" + params[key])
    end for
    return Join(result, "&")
end function
