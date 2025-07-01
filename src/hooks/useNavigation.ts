import { useGo } from "@refinedev/core";

export interface Navigation {
  create: (resource: string) => void;
  edit: (resource: string, id: string | number) => void;
  show: (resource: string, id: string | number) => void;
  list: (resource: string) => void;
  goBack: () => void;
}

export const useNavigation = (): Navigation => {
  const go = useGo();

  return {
    create: (resource: string) => {
      go({
        to: `/${resource}/create`,
        type: "push",
      });
    },
    edit: (resource: string, id: string | number) => {
      go({
        to: `/${resource}/edit/${id}`,
        type: "push",
      });
    },
    show: (resource: string, id: string | number) => {
      go({
        to: `/${resource}/show/${id}`,
        type: "push",
      });
    },
    list: (resource: string) => {
      go({
        to: `/${resource}`,
        type: "push",
      });
    },
    goBack: () => {
      go({
        to: "/",
        type: "push",
      });
    },
  };
};

// Helper function to check if user can access a route
export const canAccessResource = (resource: string, action: string): boolean => {
  // This would integrate with your permission system
  // For now, return true - you can enhance this based on your needs
  return true;
};

// Helper function to get accessible routes for navigation
export const getAccessibleRoutes = (resources: string[]): string[] => {
  return resources.filter(resource => canAccessResource(resource, 'list'));
}; 