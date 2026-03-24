$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  رفع تطبيق الغامض على GitHub Pages" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "أدخل GitHub Token (ghp_...)"
$username = "ss20a3-pixel"
$repo = "alghamid-voicechat"

Write-Host "`nإنشاء المستودع على GitHub..." -ForegroundColor Green

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github+json"
}

$body = @{
    name = $repo
    description = "تطبيق الغامض للدردشة الصوتية - Arabic Voice Chat App"
    homepage = "https://$username.github.io/$repo"
    private = $false
    has_pages = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "تم إنشاء المستودع بنجاح!" -ForegroundColor Green
} catch {
    Write-Host "المستودع موجود مسبقاً أو خطأ: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nرفع الملفات..." -ForegroundColor Green

Set-Location "C:\Users\dell\.verdent\verdent-projects\new-project\voicechat-app"

git branch -M main
git remote remove origin 2>$null
git remote add origin "https://${token}@github.com/${username}/${repo}.git"
git push -u origin main --force

Write-Host "`nتفعيل GitHub Pages..." -ForegroundColor Green

$pagesBody = @{
    source = @{
        branch = "main"
        path = "/"
    }
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$username/$repo/pages" -Method Post -Headers $headers -Body $pagesBody -ContentType "application/json"
    Write-Host "تم تفعيل GitHub Pages!" -ForegroundColor Green
} catch {
    Write-Host "GitHub Pages قد يكون مفعل مسبقاً" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  التطبيق جاهز!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "رابط التطبيق (انتظر 1-2 دقيقة للتفعيل):" -ForegroundColor Yellow
Write-Host "  https://$username.github.io/$repo/" -ForegroundColor Cyan
Write-Host ""
Write-Host "لوحة التحكم:" -ForegroundColor Yellow
Write-Host "  https://$username.github.io/$repo/admin.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub:" -ForegroundColor Yellow
Write-Host "  https://github.com/$username/$repo" -ForegroundColor Cyan
Write-Host ""

Read-Host "اضغط Enter للإغلاق"
