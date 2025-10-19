package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/application"
)

// TemplateHandler handles HTTP requests for templates
type TemplateHandler struct {
	templateService *application.TemplateService
}

// NewTemplateHandler creates a new template handler
func NewTemplateHandler(templateService *application.TemplateService) *TemplateHandler {
	return &TemplateHandler{
		templateService: templateService,
	}
}

// GetTemplates handles GET /api/templates
func (h *TemplateHandler) GetTemplates(c echo.Context) error {
	templates, err := h.templateService.GetAllTemplates()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, templates)
}
