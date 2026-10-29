$paths = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Capture'
foreach ($p in $paths) {
    $devState = (Get-ItemProperty $p.PSPath).DeviceState
    $propKey = Join-Path $p.PSPath 'Properties'
    $name = (Get-ItemProperty $propKey).'{a45c254e-df1c-4efd-8020-67d146a850e0},2'
    Write-Output "ID: $($p.PSChildName) | State: $devState | Name: $name"
}
