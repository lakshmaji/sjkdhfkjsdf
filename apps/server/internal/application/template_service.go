package application

import (
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// TemplateService handles template-related business logic
type TemplateService struct {
	templateRepo domain.TemplateRepository
}

// NewTemplateService creates a new template service
func NewTemplateService(templateRepo domain.TemplateRepository) *TemplateService {
	return &TemplateService{
		templateRepo: templateRepo,
	}
}

// GetAllTemplates retrieves all timer templates
func (s *TemplateService) GetAllTemplates() ([]*domain.TimerTemplate, error) {
	return s.templateRepo.GetAllTemplates()
}
