Get-ChildItem -Recurse -Include '*.ts','*.tsx' | ForEach-Object {
    $content = Get-Content $_
    if ($content -match 'import { authOptions } from "@lib/auth"') {
        $content = $content -replace 'import { authOptions } from "@/app/api/auth/\[...nextauth\]/route"', 'import { authOptions } from "@/lib/auth"'
        Set-Content $_ $content
        Write-Host "Fixed $_"
    }
}