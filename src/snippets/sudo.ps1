<#
# sudo.ps1
# holds a recreation of the sudo command
# Sudo: elevates powershell or command to admin
#>
function Sudo {
    <#
    .SYNOPSIS
        Elevates powershell or commamergnd to admin.
    .DESCRIPTION
        Elevates powershell or command to admin.
        Sudo -> opens a new powershell window as admin.
        Sudo {command -args} -> runs the command as admin.
    .EXAMPLE
        Sudo
    .OUTPUTS    
        System.String
    #>
    $pwrsh = "$psHome\powershell.exe"
    if (!(Test-Path $pwrsh)) {
        $pwrsh = "$psHome\pwsh.exe"
    }
    $isAdmin = isadmin
    if ($args.Count -gt 0) {
        if (Test-Path (Get-Command $args[0]).Definition) {
            return Start-Process (Get-Command $args[0]).Definition -Verb RunAs -ArgumentList ($args[1..($args.Length - 1)] -join " ") -WorkingDirectory $PWD
        }
        if ($isAdmin) {
            return & $args
        }
        return Start-Process $pwrsh -Verb RunAs -WorkingDirectory $PWD -ArgumentList "-NoExit", "-NoLogo", "-Command & {$args}"
    }
    if ($isAdmin) {
        return Write-Host("Shell is already running as admin.") -Fore Red
    }
    Start-Process $pwrsh -Verb runAs -ArgumentList "-NoExit", "-NoLogo"
}