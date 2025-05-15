
# Script: add-github-secrets.sh
# Tự động thêm tất cả biến môi trường từ file .env vào GitHub Secrets
# Yêu cầu: Đã cài đặt GitHub CLI (gh) và đã đăng nhập bằng lệnh `gh auth login`
# Sử dụng: ./bin/add-github-secrets.sh <tên-repo> (ví dụ: duyvn/ProjectT)

if [ -z "$1" ]; then
  echo "Vui lòng truyền vào tên repository dạng <owner>/<repo> (ví dụ: duyvn/ProjectT)"
  exit 1
fi

REPO="$1"
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Không tìm thấy file .env ở thư mục hiện tại!"
  exit 1
fi

while IFS= read -r line; do
  # Bỏ qua dòng trống và dòng comment
  if [[ "$line" =~ ^# ]] || [[ -z "$line" ]]; then
    continue
  fi
  # Loại bỏ dấu // nếu có
  if [[ "$line" =~ ^// ]]; then
    continue
  fi
  # Lấy tên biến và giá trị
  VAR_NAME=$(echo "$line" | cut -d'=' -f1 | xargs)
  VAR_VALUE=$(echo "$line" | cut -d'=' -f2- | xargs)
  if [ -n "$VAR_NAME" ] && [ -n "$VAR_VALUE" ]; then
    echo "Đang thêm secret: $VAR_NAME"
    gh secret set "$VAR_NAME" -b"$VAR_VALUE" -R "$REPO"
  fi
done < "$ENV_FILE"

echo "Hoàn tất thêm secrets từ $ENV_FILE lên repository $REPO!"
