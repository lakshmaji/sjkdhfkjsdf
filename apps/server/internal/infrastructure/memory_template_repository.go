package infrastructure

import (
	"errors"
	"sync"

	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// MemoryTemplateRepository implements TemplateRepository using in-memory storage
type MemoryTemplateRepository struct {
	templates map[string]*domain.TimerTemplate
	mu        sync.RWMutex
}

// NewMemoryTemplateRepository creates a new in-memory template repository
func NewMemoryTemplateRepository() *MemoryTemplateRepository {
	repo := &MemoryTemplateRepository{
		templates: make(map[string]*domain.TimerTemplate),
	}
	repo.initBuiltInTemplates()
	return repo
}

// GetAllTemplates retrieves all templates
func (r *MemoryTemplateRepository) GetAllTemplates() ([]*domain.TimerTemplate, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	templates := make([]*domain.TimerTemplate, 0, len(r.templates))
	for _, tmpl := range r.templates {
		templates = append(templates, tmpl)
	}
	return templates, nil
}

// GetTemplate retrieves a template by ID
func (r *MemoryTemplateRepository) GetTemplate(templateID string) (*domain.TimerTemplate, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	tmpl, exists := r.templates[templateID]
	if !exists {
		return nil, errors.New("template not found")
	}
	return tmpl, nil
}

func (r *MemoryTemplateRepository) initBuiltInTemplates() {
	builtInTemplates := []domain.TimerTemplate{
		{
			ID:              "pomodoro",
			Name:            "Pomodoro",
			Duration:        1500, // 25 minutes
			Direction:       "backward",
			BackgroundColor: "#ef4444",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
		{
			ID:              "short-break",
			Name:            "Short Break",
			Duration:        300, // 5 minutes
			Direction:       "backward",
			BackgroundColor: "#10b981",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
		{
			ID:              "long-break",
			Name:            "Long Break",
			Duration:        900, // 15 minutes
			Direction:       "backward",
			BackgroundColor: "#3b82f6",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
		{
			ID:              "stopwatch",
			Name:            "Stopwatch",
			Duration:        0,
			Direction:       "forward",
			BackgroundColor: "#8b5cf6",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
	}

	for _, tmpl := range builtInTemplates {
		t := tmpl
		r.templates[tmpl.ID] = &t
	}
}
