import { prefixPluginTranslations } from "@strapi/helper-plugin";
import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";
import { SuperSingleSelect, SuperMultiSelect, SuperInput, SuperTextArea, SuperImage, SuperAudio } from './components/SuperFields';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: pluginPkg.strapi.displayName,
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "[request]" */
          "./pages/App"
        );

        return component;
      },
      permissions: [],
    });

    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.plugin.name`,
          defaultMessage: `${pluginPkg.strapi.displayName} ${pluginPkg.strapi.kind}`,
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: "Configuration",
          },
          id: "strapi-supergpt",
          to: `/settings/${pluginId}`,
          Component: async () => {
            const component = await import(
              /* webpackChunkName: "stripe-page" */
              "./pages/Settings"
            );

            return component;
          },
        },
      ],
    );

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });

    // Register custom fields with translations
    const customFields = [
      { name: 'super-input', type: 'string', component: SuperInput },
      { name: 'super-single-select', type: 'string', component: SuperSingleSelect },
      { name: 'super-multi-select', type: 'string', component: SuperMultiSelect },
      { name: 'super-textarea', type: 'text', component: SuperTextArea },
      { name: 'super-image', type: 'media', component: SuperImage },
      { name: 'super-audio', type: 'media', component: SuperAudio },
    ];

    customFields.forEach(field => {
      app.customFields.register({
        name: field.name,
        pluginId: pluginId,
        type: field.type,
        intlLabel: {
          id: `${pluginId}.customFields.${field.name}.label`,
          defaultMessage: field.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        },
        intlDescription: {
          id: `${pluginId}.customFields.${field.name}.description`,
          defaultMessage: `A ${field.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} field powered by chatgpt`,
        },
        icon: PluginIcon,
        components: {
          Input: async () => field.component,
        },
      });
    });
  },

  bootstrap(app) {},

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */
          `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );

    return Promise.resolve(importedTrads);
  },
};
